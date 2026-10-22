#!/usr/bin/env python3
"""Five full-product UI samples on a task-owned device; metadata-only evidence.

Requires the hosted_native.py foundation and its successful exact-source build.
Normal Metro entrypoint is mandatory. The loopback responder is a controlled
createNewApp transport fixture, NEVER evidence of Relay compatibility.
"""
import importlib.util
import hashlib
import json
import os
from pathlib import Path
import shutil
import signal
import subprocess
import tempfile
import threading
import time
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
import urllib.request

STAGES = ('startup_start', 'startup_ready', 'wallet_start', 'wallet_ready',
          'home_ready', 'relaunch_start', 'relaunch_login', 'relaunch_home',
          'navigation_verified')
PORT = 8765
SAMPLE_COUNT = 5


class Receipt:
    """Fixed vocabulary and numbers only; never store a request body/identifier."""
    def __init__(self):
        self.lock = threading.Lock()
        self.reset(1)

    def reset(self, sample):
        with self.lock:
            self.sample, self.times = sample, []
            self.create_calls, self.blocked_calls = 0, 0

    def mark(self, stage):
        with self.lock:
            if len(self.times) >= len(STAGES) or stage != STAGES[len(self.times)]:
                return False
            self.times.append(time.monotonic_ns())
            return True

    def snapshot(self, passed=False):
        with self.lock:
            if passed and (len(self.times) != len(STAGES) or self.create_calls != 1):
                raise RuntimeError('PRODUCT_UI_INCOMPLETE_OR_DUPLICATE_SETUP')
            stamps = dict(zip(STAGES, self.times))
            pairs = {
                'startup_to_passcode_ms': ('startup_start', 'startup_ready'),
                'start_new_to_ready_ms': ('wallet_start', 'wallet_ready'),
                'start_new_to_home_ms': ('wallet_start', 'home_ready'),
                'cold_relaunch_to_login_ms': ('relaunch_start', 'relaunch_login'),
                'cold_relaunch_to_authenticated_home_ms': ('relaunch_start', 'relaunch_home'),
            }
            durations = {name: round((stamps[end] - stamps[start]) / 1_000_000, 3)
                         for name, (start, end) in pairs.items() if end in stamps and start in stamps}
            return {'sample': self.sample, 'status': 'PASS' if passed else 'FAIL',
                    'completed_stages': list(STAGES[:len(self.times)]), 'raw_durations': durations,
                    'create_new_app_calls': self.create_calls, 'other_backend_calls_rejected': self.blocked_calls,
                    'visible_wallet_count_before_relaunch': 1 if 'home_ready' in stamps else None,
                    'visible_wallet_count_after_relaunch': 1 if 'relaunch_home' in stamps else None,
                    'more_wallets_navigation': 'PASS' if 'navigation_verified' in stamps else 'NOT RUN'}


def make_server(receipt, port=PORT):
    class Handler(BaseHTTPRequestHandler):
        def log_message(self, *_):
            pass

        def reply(self, status, value):
            raw = json.dumps(value).encode()
            self.send_response(status)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Content-Length', str(len(raw)))
            self.end_headers()
            self.wfile.write(raw)

        def do_POST(self):
            try:
                length = int(self.headers.get('Content-Length', '0'))
                if not 0 < length <= 8192:
                    self.close_connection = True
                    return self.reply(413, {'error': 'FIXTURE_BODY_REJECTED'})
                # createNewApp carries disposable public identifiers/FCM data.
                # Discard without parsing, logging, echoing or retaining them.
                raw = self.rfile.read(length)
                if self.path == '/createNewApp':
                    with receipt.lock:
                        receipt.create_calls += 1
                    return self.reply(200, {'created': True})
                if self.path == '/metric' and length <= 128:
                    metric = json.loads(raw)
                    if (isinstance(metric, dict) and set(metric) == {'stage'} and
                            receipt.mark(metric['stage'])):
                        return self.reply(200, {'accepted': True})
                    return self.reply(422, {'error': 'FIXED_METRIC_REJECTED'})
            except (ValueError, TypeError):
                return self.reply(422, {'error': 'FIXED_METRIC_REJECTED'})
            with receipt.lock:
                receipt.blocked_calls += 1
            self.reply(503, {'error': 'DISPOSABLE_FIXTURE_UNSUPPORTED_ROUTE'})

        def do_GET(self):
            self.reply(503, {'error': 'DISPOSABLE_FIXTURE_UNSUPPORTED_ROUTE'})

    class Server(ThreadingHTTPServer):
        allow_reuse_address = False
        daemon_threads = True

    return Server(('127.0.0.1', port), Handler)


def verify_package_overlay(original_bytes, installed_bytes, overlay):
    """Accept only the foundation's exact recorded module-mapping overlay."""
    allowed = ['browser', 'react-native', 'browserify']
    if (not isinstance(overlay, dict) or overlay.get('path') != 'package.json' or
            overlay.get('allowed_fields') != allowed or
            overlay.get('before_sha256') != hashlib.sha256(original_bytes).hexdigest() or
            overlay.get('after_sha256') != hashlib.sha256(installed_bytes).hexdigest()):
        raise RuntimeError('PRODUCT_UI_PACKAGE_OVERLAY_UNRECORDED')
    try:
        original, installed = json.loads(original_bytes), json.loads(installed_bytes)
        if not isinstance(original, dict) or not isinstance(installed, dict):
            raise ValueError('Expected manifest objects')
        for field in allowed:
            original.pop(field, None)
            installed.pop(field, None)
        if original != installed:
            raise ValueError('Protected manifest fields changed')
    except (ValueError, TypeError, UnicodeError):
        raise RuntimeError('PRODUCT_UI_PACKAGE_PROTECTED_FIELDS_CHANGED') from None


def run(h):
    if (os.environ.get('GITHUB_ACTIONS') != 'true' or
            os.environ.get('RUNNER_ENVIRONMENT') != 'github-hosted'):
        raise RuntimeError('PRODUCT_UI_DISPOSABLE_HOSTED_RUNNER_REQUIRED')
    data = h.read()
    first_private_command = len(data.get('commands', [])) + 1
    actual_source = subprocess.check_output(['git', 'rev-parse', 'HEAD'], cwd=h.ROOT, text=True).strip()
    if (data['build'] != 'PASS' or data['source_sha'] != os.environ.get('KEEPER_SOURCE_SHA') or
            actual_source != data['source_sha'] or h.artifact_identity() != data['built_artifact']):
        raise RuntimeError('PRODUCT_UI_EXACT_BUILD_REQUIRED')
    source_paths = ['.github/native', 'src', 'index.js', 'App.tsx', 'App.js', 'shim.js',
                    'AndroidFontFix.js', 'metro.config.js', 'babel.config.js', 'app.json',
                    'react-native.config.js', 'tsconfig.json', 'yarn.lock']
    if subprocess.run(['git', 'diff', '--quiet', 'HEAD', '--', *source_paths],
                      cwd=h.ROOT, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL).returncode:
        raise RuntimeError('PRODUCT_UI_COMMITTED_SOURCE_REQUIRED')
    verify_package_overlay(
        subprocess.check_output(['git', 'show', 'HEAD:package.json'], cwd=h.ROOT),
        (h.ROOT / 'package.json').read_bytes(), data.get('nodeify_overlay'))
    expected_environment = {
        'ENVIRONMENT': 'DEVELOPMENT', 'RELAY': 'http://127.0.0.1:8765/',
        'SIGNING_SERVER_TESTNET': 'https://127.0.0.1:9/',
        'SIGNING_SERVER_MAINNET': 'https://127.0.0.1:9/',
        'CHANNEL_URL': 'https://127.0.0.1:9/',
        'SENTRY_DNS': 'https://public@127.0.0.1:9/1',
        'ENC_KEY_STORAGE_IDENTIFIER': 'KEEPER-HOSTED-DISPOSABLE',
    }
    environment_lines = (h.ROOT / '.env.ci').read_text().splitlines()
    if (len(environment_lines) != len(expected_environment) or
            dict(line.split('=', 1) for line in environment_lines) != expected_environment):
        raise RuntimeError('PRODUCT_UI_LOOPBACK_BUILD_REQUIRED')
    private = Path(tempfile.mkdtemp(prefix='keeper-product-ui-', dir=h.PRIVATE))
    private.chmod(0o700)
    receipt = Receipt()
    server, metro, device = None, None, None
    # Only app/test-specific data created here is removed. Never touch shared
    # caches, another worktree, an existing iOS simulator or a real phone.
    result = {'status': 'RUNNING', 'samples': [], 'requested_samples': SAMPLE_COUNT,
              'entrypoint': 'index.js', 'network': 'TESTNET', 'backend': 'CONTROLLED_LOOPBACK_CREATE_ONLY',
              'backend_compatibility': 'NOT TESTED', 'physical_devices': 'NOT RUN',
              'performance_scope': 'Development app with warm Metro bundle; cold process/UI timing includes Maestro driver overhead. Not release-build performance.',
              'count_scope': 'Actual rendered visible wallet list; disposable one-wallet account, not hidden/archived wallet counts.',
              'network_scope': 'Fresh production Splash selects Testnet for DEVELOPMENT. Account backend is loopback fixture; signing/channel/Sentry endpoints blocked. Public Testnet Electrum connectivity may fail or connect; no faucet, funded wallet, send, signing or backup opt-in.'}

    def save():
        current = h.read()
        current['product_ui'] = result
        h.save(current)

    save()
    try:
        server = make_server(receipt)
        thread = threading.Thread(target=server.serve_forever, daemon=True)
        thread.start()
        # Ordinary product bundle: no --config override and no probe entrypoint.
        with (private / 'metro.log').open('wb') as log:
            metro = subprocess.Popen(['node', 'node_modules/react-native/cli.js', 'start', '--port', '8081'],
                                     cwd=h.ROOT, stdout=log, stderr=subprocess.STDOUT,
                                     start_new_session=True)
            for _ in range(60):
                if metro.poll() is not None:
                    raise RuntimeError('PRODUCT_UI_METRO_FAILED')
                try:
                    with urllib.request.urlopen('http://127.0.0.1:8081/status', timeout=2) as response:
                        if b'packager-status:running' in response.read():
                            break
                except OSError:
                    time.sleep(1)
            else:
                raise RuntimeError('PRODUCT_UI_METRO_NOT_READY')
            h.warm_metro_bundle('startup')
            if h.PLATFORM == 'IOS':
                device = h.command(['xcrun', 'simctl', 'create', 'Keeper-product-ui-disposable',
                                    'com.apple.CoreSimulator.SimDeviceType.iPhone-16',
                                    'com.apple.CoreSimulator.SimRuntime.iOS-18-5'],
                                   'Create task-owned product UI simulator', capture=True)
                h.command(['xcrun', 'simctl', 'boot', device], 'Boot product UI simulator')
                h.command(['xcrun', 'simctl', 'bootstatus', device, '-b'], 'Wait for product UI simulator', timeout=240)
                artifact = str(h.PRIVATE / 'DerivedData/Build/Products/Debug-iphonesimulator/hexa_keeper_dev.app')
                result['device'] = {'profile': 'iPhone 16', 'runtime': 'iOS 18.5', 'kind': 'SIMULATOR'}
            else:
                device = h.command(['adb', 'get-serialno'], 'Select disposable CI emulator', capture=True)
                if not device.startswith('emulator-'):
                    raise RuntimeError('PRODUCT_UI_REAL_ANDROID_DEVICE_REJECTED')
                for port in ('8081', str(PORT)):
                    h.command(['adb', '-s', device, 'reverse', 'tcp:' + port, 'tcp:' + port],
                              'Connect disposable emulator to local fixture')
                artifact = str(h.ROOT / 'android/app/build/outputs/apk/development/debug/app-development-debug.apk')
                result['device'] = {'kind': 'EMULATOR', 'image': h.command(
                    ['adb', '-s', device, 'shell', 'getprop', 'ro.build.fingerprint'],
                    'Record actual product UI emulator image', capture=True)}
            app = h.APP_IDS[h.PLATFORM]
            for sample in range(1, SAMPLE_COUNT + 1):
                receipt.reset(sample)
                output = private / ('sample-%d' % sample)
                output.mkdir()
                report = output / 'junit.xml'
                if h.PLATFORM == 'IOS':
                    # Uninstall plus reset of this newly-created simulator's
                    # keychain prevents prior sample credentials persisting.
                    subprocess.run(['xcrun', 'simctl', 'uninstall', device, app],
                                   stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, timeout=30, check=False)
                    h.command(['xcrun', 'simctl', 'keychain', device, 'reset'], 'Reset task-owned simulator credentials')
                    h.command(['xcrun', 'simctl', 'install', device, artifact], 'Install exact product UI app', timeout=120)
                else:
                    h.command(['adb', '-s', device, 'install', '-r', artifact], 'Install exact product UI APK', timeout=120)
                    h.command(['adb', '-s', device, 'shell', 'pm', 'clear', app], 'Clear only disposable development app')
                try:
                    h.command([data['maestro']['binary'], '--device', device, 'test',
                               '--env', 'APP_ID=' + app, '--flatten-debug-output',
                               '--debug-output', str(output), '--test-output-dir', str(output),
                               '--format', 'junit', '--output', str(report),
                               '.github/native/product_first_wallet.yaml'],
                              'Full-product first-wallet and relaunch UI sample', timeout=600, error_details=False)
                    h.successful_junit(report)
                    if h.artifact_identity() != data['built_artifact']:
                        raise RuntimeError('PRODUCT_UI_ARTIFACT_CHANGED')
                    result['samples'].append(receipt.snapshot(passed=True))
                except Exception:
                    result['samples'].append(receipt.snapshot())
                    raise
                finally:
                    # Maestro can capture automatic failure diagnostics. Keep no
                    # screenshots, hierarchy, PIN actions or app output artifacts.
                    shutil.rmtree(output, ignore_errors=True)
                save()
        result['status'] = 'PASS'
    except Exception as error:
        result['status'] = 'FAIL'
        result['failure_category'] = type(error).__name__  # never raw error text
        raise
    finally:
        # Save original outcome before best-effort disposal so a cleanup issue
        # cannot erase a native failure or the completed raw numeric samples.
        save()
        if metro and metro.poll() is None:
            os.killpg(metro.pid, signal.SIGTERM)
            try:
                metro.wait(timeout=10)
            except subprocess.TimeoutExpired:
                os.killpg(metro.pid, signal.SIGKILL)
        if server:
            server.shutdown()
            server.server_close()
        cleanup_failed = False

        def cleanup(args):
            nonlocal cleanup_failed
            try:
                code = subprocess.run(args, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL,
                                      timeout=30, check=False).returncode
                if code and result['status'] == 'PASS':
                    cleanup_failed = True
            except (OSError, subprocess.TimeoutExpired):
                cleanup_failed = True

        if device and h.PLATFORM == 'IOS':
            for action in ('shutdown', 'delete'):
                cleanup(['xcrun', 'simctl', action, device])
        elif device and device.startswith('emulator-'):
            cleanup(['adb', '-s', device, 'uninstall', h.APP_IDS[h.PLATFORM]])
            cleanup(['adb', '-s', device, 'reverse', '--remove', 'tcp:' + str(PORT)])
        shutil.rmtree(private, ignore_errors=True)
        # Foundation command metadata is safe/nonsecret; its process logs from
        # this suite are not retained even on the ephemeral runner.
        for index in range(first_private_command, len(h.read().get('commands', [])) + 1):
            (h.PRIVATE / ('command-%03d.log' % index)).unlink(missing_ok=True)
        if cleanup_failed:
            result['status'] = 'FAIL'
            result['cleanup'] = 'FAILED'
        save()
        if cleanup_failed:
            raise RuntimeError('PRODUCT_UI_DISPOSABLE_CLEANUP_FAILED')


if __name__ == '__main__':
    import sys
    if sys.argv[1:] != ['run']:
        raise SystemExit('Expected run; hosted exact-source build prerequisite required.')
    spec = importlib.util.spec_from_file_location('hosted_native', Path(__file__).with_name('hosted_native.py'))
    foundation = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(foundation)
    if foundation.PLATFORM not in foundation.APP_IDS:
        raise SystemExit('Expected hosted IOS or ANDROID platform.')
    run(foundation)
