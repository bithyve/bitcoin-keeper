"""Offline startup-observer lifecycle controls; no emulator or native credit."""

from contextlib import ExitStack
import importlib.util
from pathlib import Path
import tempfile
from types import SimpleNamespace
import unittest
from unittest import mock


SPEC = importlib.util.spec_from_file_location(
    'startup_integration_native', Path(__file__).resolve().parents[1] / 'native/hosted_native.py')
native = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(native)


class StartupIntegrationTest(unittest.TestCase):
    def setUp(self):
        temporary = tempfile.TemporaryDirectory()
        self.addCleanup(temporary.cleanup)
        self.root = Path(temporary.name)
        self.events = []
        self.device = 'emulator-5554'
        self.artifact = {'sha256': 'a' * 64}
        self.metro = mock.Mock(pid=7000)
        self.metro.poll.return_value = None
        self.capture = object()
        self.observer = SimpleNamespace(
            start=mock.Mock(side_effect=self.start),
            collect=mock.Mock(side_effect=self.collect),
            stop=mock.Mock(side_effect=self.stop),
            observe=mock.Mock(),
        )
        self.original_error = RuntimeError('PRIVATE_SENTINEL original smoke failure')

    def start(self, context, device):
        self.assertEqual(context.PLATFORM, 'ANDROID')
        self.assertEqual(context.PRIVATE, self.root)
        self.assertEqual(device, self.device)
        self.events.append('capture-start')
        return self.capture

    def collect(self, context, device, capture):
        self.assertEqual(device, self.device)
        self.assertIn(capture, [self.capture, None])
        self.events.append('capture-collect')
        return {'scope': 'startup only', 'collection_errors': []}

    def stop(self, capture):
        self.assertIn(capture, [self.capture, None])
        self.events.append('capture-stop')

    def exercise(self, suite='startup', smoke_fails=False, start_fails=False,
                 collect_fails=False, stop_fails=False, platform='ANDROID',
                 import_fails=False, popen_fails=False, install_fails=False, readiness_fails=False):
        captured = {}

        def command(args, label, **kwargs):
            if label == 'Identify fresh emulator':
                return self.device
            if label == 'Record actual adb version':
                return 'Android Debug Bridge version 1.0.41'
            if label == 'Record Android emulator image':
                return 'fixed-disposable-image'
            if label == 'Create fresh iPhone 16 iOS 18.5 simulator':
                return '12345678-1234-1234-1234-123456789ABC'
            if label == 'Install unsigned development app':
                captured['install_command_count'] = captured.get('install_command_count', 0) + 1
                captured['install_args'] = args
                captured['install_options'] = kwargs
                if install_fails:
                    raise self.original_error
            if label.startswith('Assert '):
                self.events.append('maestro')
                captured['flow'] = args[-1]
                if smoke_fails:
                    raise self.original_error

        def popen(args, **kwargs):
            captured['metro_args'] = args
            captured['metro_options'] = kwargs
            if popen_fails:
                raise OSError('PRIVATE_SENTINEL Metro spawn failure')
            return self.metro

        original_open = Path.open

        def track_output(path, *args, **kwargs):
            handle = original_open(path, *args, **kwargs)
            if path == self.root / 'metro.log':
                captured['metro_output'] = handle
            return handle

        def load_observer(module):
            if import_fails:
                raise RuntimeError('PRIVATE_SENTINEL observer import failure')

        def observe_install(context, device, args, label, **kwargs):
            self.events.append('install-observe')
            self.assertEqual(device, '12345678-1234-1234-1234-123456789ABC')
            self.assertEqual(context.PRIVATE, self.root)
            return context.command(args, label, **kwargs)

        self.observer.observe.side_effect = observe_install

        def ready(device):
            self.events.append('app-services-ready')
            if readiness_fails:
                raise self.original_error

        def dispose(args, **kwargs):
            self.events.append('device-' + args[2] if args[0] == 'xcrun' else 'device-uninstall')
            return SimpleNamespace(returncode=0)

        def fail_start(*args):
            self.events.append('capture-start')
            raise OSError('PRIVATE_SENTINEL start failure')

        def fail_collect(*args):
            self.events.append('capture-collect')
            raise OSError('PRIVATE_SENTINEL collection failure')

        def fail_stop(*args):
            self.events.append('capture-stop')
            raise OSError('PRIVATE_SENTINEL stop failure')

        if start_fails:
            self.observer.start.side_effect = fail_start
        if collect_fails:
            self.observer.collect.side_effect = fail_collect
        if stop_fails:
            self.observer.stop.side_effect = fail_stop
        response = mock.MagicMock()
        response.__enter__.return_value.read.return_value = b'packager-status:running'
        loader = SimpleNamespace(exec_module=load_observer)
        with ExitStack() as stack:
            # A failed assertion must never render the worker's inherited env.
            stack.enter_context(mock.patch.dict(native.os.environ, {'KEEPER_PUBLIC_TEST_ENV': 'fixture'}, clear=True))
            stack.enter_context(mock.patch.multiple(native, PRIVATE=self.root, EVIDENCE=self.root / 'metadata.json',
                                                    ROOT=self.root, PLATFORM=platform))
            native.save({'commands': [], 'build': 'PASS', 'smoke': 'PASS' if suite != 'startup' else 'NOT RUN',
                         'built_artifact': self.artifact, 'toolchain': {}, 'maestro': {'binary': 'fixed-maestro'}})
            patches = [
                (native, 'command', command),
                (native, 'artifact_identity', lambda: self.artifact),
                (native, 'verify_installed_artifact', lambda device: self.events.append('installed-proof')),
                (native, 'android_sdk_metadata', lambda *args: {'version': 'fixed'}),
                (native, 'warm_metro_bundle', lambda suite: self.events.append('warm-' + suite)),
                (native, 'wait_for_simulator_app_services', ready),
                (native, 'successful_junit', lambda report: 1),
                (native, 'record_startup_failure', lambda *args: self.events.append('failure-diagnostics')),
                (native, 'collect_r5_feature_evidence', lambda device: {'status': 'PASS'}),
                (native.subprocess, 'Popen', popen),
                (native.subprocess, 'run', dispose),
                (native.urllib.request, 'urlopen', lambda *args, **kwargs: response),
                (native.os, 'killpg', lambda *args: self.events.append('metro-stop')),
                (native.Path, 'open', track_output),
                (native.importlib.util, 'spec_from_file_location', lambda *args: SimpleNamespace(loader=loader)),
                (native.importlib.util, 'module_from_spec', lambda *args: self.observer),
            ]
            for owner, name, replacement in patches:
                stack.enter_context(mock.patch.object(owner, name, replacement))
            try:
                native.smoke(suite)
            except Exception as error:
                captured['error'] = error
            captured['metadata'] = native.read()
        return captured

    def test_android_capture_stays_inside_owned_startup_and_all_resources_close(self):
        value = self.exercise()
        self.assertNotIn('error', value)
        self.assertEqual(value['metadata']['smoke'], 'PASS')
        self.assertEqual(value['metadata']['startup_observation']['scope'], 'startup only')
        self.assertEqual(value['flow'], '.github/native/startup.yaml')
        self.assertEqual(value['metro_args'][-4:], [
            '--config', str(self.root / '.github/native/startup_observer.cjs'),
            '--custom-log-reporter-path', str(self.root / '.github/native/startup_reporter.cjs'),
        ])
        self.assertEqual(value['metro_options']['env']['KEEPER_STARTUP_OBSERVER_PATH'],
                         str(self.root / 'startup-observer.jsonl'))
        for before, after in [('capture-start', 'maestro'), ('maestro', 'capture-collect'),
                              ('capture-collect', 'capture-stop'), ('capture-stop', 'metro-stop'),
                              ('metro-stop', 'device-uninstall')]:
            self.assertLess(self.events.index(before), self.events.index(after))
        self.assertTrue(value['metro_options']['stdout'].closed)

    def test_capture_failure_is_optional_but_collection_and_disposal_still_happen(self):
        value = self.exercise(collect_fails=True)
        self.assertNotIn('error', value)
        self.assertEqual(value['metadata']['smoke'], 'PASS')
        self.assertEqual(value['metadata']['startup_observation'], {'collection_errors': ['collector']})
        self.assertNotIn('startup_observation_cleanup', value['metadata'])
        self.assertIn('capture-stop', self.events)
        self.assertIn('metro-stop', self.events)
        self.assertIn('device-uninstall', self.events)
        self.assertNotIn('PRIVATE_SENTINEL', str(value['metadata']))

    def test_failed_capture_start_keeps_the_real_smoke_outcome_and_closes_other_resources(self):
        value = self.exercise(start_fails=True)
        self.assertNotIn('error', value)
        self.assertEqual(value['metadata']['smoke'], 'PASS')
        self.assertEqual(value['metadata']['startup_observation_capture'], 'UNAVAILABLE')
        self.observer.collect.assert_called_once()
        self.observer.stop.assert_called_once_with(None)
        self.assertIn('metro-stop', self.events)
        self.assertIn('device-uninstall', self.events)
        self.assertTrue(value['metro_options']['stdout'].closed)
        self.assertNotIn('PRIVATE_SENTINEL', str(value['metadata']))

    def test_original_smoke_failure_survives_observer_and_cleanup_failures(self):
        value = self.exercise(smoke_fails=True, collect_fails=True, stop_fails=True)
        self.assertIs(value['error'], self.original_error)
        self.assertEqual(value['metadata']['startup_observation_cleanup'], 'FAIL')
        self.assertIn('metro-stop', self.events)
        self.assertIn('device-uninstall', self.events)

    def test_observer_import_or_metro_spawn_failure_closes_output_before_any_device_work(self):
        for option in ['import_fails', 'popen_fails']:
            with self.subTest(option=option):
                self.events.clear()
                value = self.exercise(**{option: True})
                self.assertIsNotNone(value.get('error'))
                self.assertTrue(value['metro_output'].closed)
                self.assertEqual(self.events, [])
                self.assertEqual(value['metadata']['smoke'], 'NOT RUN')
                self.assertNotIn('startup_observation', value['metadata'])
                self.assertNotIn('PRIVATE_SENTINEL', str(value['metadata']))
        self.assertTrue(value['metro_options']['stdout'].closed)
        self.assertNotIn('PRIVATE_SENTINEL', str(value['metadata']))

    def test_unstopped_capture_cannot_allow_a_successful_phase_to_continue(self):
        value = self.exercise(stop_fails=True)
        self.assertIsNotNone(value.get('error'), 'an unconfirmed live capture must block subsequent feature/account probes')
        self.assertEqual(value['metadata']['startup_observation_cleanup'], 'FAIL')
        self.assertEqual(value['metadata']['smoke'], 'FAIL')
        self.assertIn('metro-stop', self.events)
        self.assertIn('device-uninstall', self.events)

    def test_ios_install_observation_delegates_once_before_proof_and_ui(self):
        value = self.exercise(platform='IOS')
        self.assertNotIn('error', value)
        self.observer.observe.assert_called_once()
        self.assertEqual(value['install_command_count'], 1)
        self.assertEqual(value['install_args'], [
            'xcrun', 'simctl', 'install', '12345678-1234-1234-1234-123456789ABC',
            str(self.root / 'DerivedData/Build/Products/Debug-iphonesimulator/hexa_keeper_dev.app'),
        ])
        self.assertEqual(value['install_options'], {'timeout': 120})
        self.assertLess(self.events.index('app-services-ready'), self.events.index('install-observe'))
        self.assertLess(self.events.index('install-observe'), self.events.index('installed-proof'))
        self.assertLess(self.events.index('installed-proof'), self.events.index('maestro'))
        self.assertNotIn('capture-start', self.events)
        self.assertIn('device-shutdown', self.events)
        self.assertIn('device-delete', self.events)

    def test_ios_install_failure_never_reaches_artifact_proof_or_ui_and_still_cleans_up(self):
        value = self.exercise(platform='IOS', install_fails=True)
        self.assertIs(value['error'], self.original_error)
        self.assertEqual(value['install_command_count'], 1)
        self.assertNotIn('installed-proof', self.events)
        self.assertNotIn('maestro', self.events)
        self.assertIn('failure-diagnostics', self.events)
        self.assertIn('metro-stop', self.events)
        self.assertIn('device-shutdown', self.events)
        self.assertIn('device-delete', self.events)
        self.assertTrue(value['metro_options']['stdout'].closed)

    def test_ios_unresponsive_app_services_block_install_and_ui_but_still_clean_up(self):
        value = self.exercise(platform='IOS', readiness_fails=True)
        self.assertIs(value['error'], self.original_error)
        self.observer.observe.assert_not_called()
        self.assertNotIn('install_command_count', value)
        self.assertNotIn('installed-proof', self.events)
        self.assertNotIn('maestro', self.events)
        self.assertIn('device-shutdown', self.events)
        self.assertIn('device-delete', self.events)
        self.assertTrue(value['metro_options']['stdout'].closed)

    def test_probes_and_ios_preserve_their_existing_metro_configuration_without_observation(self):
        for suite, platform, config in [('probe', 'ANDROID', 'release_metro.cjs'),
                                         ('features', 'ANDROID', 'r5_metro.cjs'),
                                         ('startup', 'IOS', None)]:
            with self.subTest(suite=suite, platform=platform):
                self.events.clear()
                value = self.exercise(suite=suite, platform=platform)
                self.assertNotIn('error', value)
                self.assertNotIn('capture-start', self.events)
                self.assertNotIn('startup_observation', value['metadata'])
                if config:
                    self.assertEqual(value['metro_args'][-2:], ['--config', str(self.root / '.github/native' / config)])
                else:
                    self.assertNotIn('--config', value['metro_args'])


if __name__ == '__main__':
    unittest.main()
