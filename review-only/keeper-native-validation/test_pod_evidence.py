"""Local synthetic logs/metadata only; never run Ruby, installers, or network."""
import contextlib
import io
import json
import os
from pathlib import Path
import tempfile
import types
import unittest
from unittest import mock

import diagnose

PRIVATE = 'PRIVATE_wallet_path_token_user_data_123'
COMMAND = ['env', 'BUNDLE_FROZEN=true', 'bundle', 'exec', 'pod', 'install', '--deployment']


class PodEvidenceTests(unittest.TestCase):
    def test_actionable_categories_discard_every_supplied_string(self):
        fixtures = [
            ('[!] There were changes to the lockfile in deployment mode:\nSPEC CHECKSUMS:\n' + PRIVATE, 'LOCKFILE_CHANGED_IN_DEPLOYMENT'),
            ('[!] There were changes to the Podfile in deployment mode', 'PODFILE_CHANGED_IN_DEPLOYMENT'),
            ('[!] CocoaPods could not find compatible versions for pod ' + PRIVATE, 'COMPATIBLE_VERSION_NOT_FOUND'),
            ('[!] None of your spec sources contain a spec satisfying ' + PRIVATE, 'SPECIFICATION_NOT_FOUND'),
            ('Bundler::GemNotFound: Could not find ' + PRIVATE + ' in locally installed gems', 'BUNDLE_GEMS_MISSING'),
            ('bundler: command not found: pod', 'BUNDLE_EXECUTABLE_NOT_IN_BUNDLE'),
            ("can't find executable pod for gem cocoapods. cocoapods is not currently included in the bundle", 'BUNDLE_EXECUTABLE_NOT_IN_BUNDLE'),
            ('The lockfile needs to be updated, but frozen mode is set', 'BUNDLE_FROZEN_LOCK_MISMATCH'),
            ('Bundler::VersionConflict: version solving has failed', 'BUNDLE_VERSION_CONFLICT'),
            ('Could not resolve dependencies: ' + PRIVATE, 'BUNDLE_VERSION_CONFLICT'),
            ('bundler: failed to load command: pod (' + PRIVATE + ')\nLoadError: cannot load such file -- ' + PRIVATE, 'RUBY_LOAD_FAILURE'),
            ('Gem::LoadError: You have already activated ' + PRIVATE + ' but your Gemfile requires another', 'RUBY_GEM_ACTIVATION_CONFLICT'),
            ('dlopen(' + PRIVATE + '): incompatible architecture', 'RUBY_NATIVE_EXTENSION_FAILURE'),
            ('SyntaxError: syntax error, unexpected token ' + PRIVATE, 'RUBY_SYNTAX_FAILURE'),
            ('NoMethodError: undefined method ' + PRIVATE, 'RUBY_METHOD_OR_NAME_FAILURE'),
            ('CDN: trunk URL couldn\'t be downloaded: https://' + PRIVATE, 'CDN_RESPONSE_FAILURE'),
            ('HTTP/2 503 at https://' + PRIVATE, 'CDN_RESPONSE_FAILURE'),
            ('OpenSSL::SSL::SSLError: certificate verify failed ' + PRIVATE, 'TLS_FAILURE'),
            ('SocketError: getaddrinfo: ' + PRIVATE, 'DNS_FAILURE'),
            ('Net::ReadTimeout: ' + PRIVATE, 'TRANSPORT_TIMEOUT'),
            ('connection reset by peer: ' + PRIVATE, 'CONNECTION_FAILURE'),
            ('Errno::EACCES: Permission denied - ' + PRIVATE, 'FILESYSTEM_PERMISSION_FAILURE'),
            ('Errno::ENOSPC: No space left on device ' + PRIVATE, 'DISK_SPACE_FAILURE'),
        ]
        for text, expected in fixtures:
            with self.subTest(expected=expected):
                result = diagnose.classify_pod_text('\x1b[31m' + text + '\x1b[0m\n' + PRIVATE)
                self.assertIn(expected, result['matched_categories'])
                self.assertEqual(result['classification'], 'KNOWN_MARKER')
                self.assertNotIn(PRIVATE, json.dumps(result))
                self.assertNotIn('https://', json.dumps(result))

    def test_unknown_empty_and_error_class_boundaries(self):
        for text in (PRIVATE, 'new arbitrary error: ' + PRIVATE, 'PrivateLoadError', 'Other::LoadError', 'LoadErrorSuffix'):
            value = diagnose.classify_pod_text(text)
            # Class extraction is exact, even where a broad marker is present.
            self.assertEqual(value['ruby_error_classes'], [])
            self.assertNotIn(PRIVATE, json.dumps(value))
        value = diagnose.classify_pod_text(PRIVATE)
        self.assertEqual(value['matched_categories'], ['UNCLASSIFIED_POD_FAILURE'])
        self.assertEqual(value['classification'], 'UNKNOWN')
        self.assertEqual(value['output_state'], 'NONEMPTY')
        self.assertEqual(diagnose.classify_pod_text(' \n')['output_state'], 'EMPTY')
        value = diagnose.classify_pod_text('Gem::LoadError ' + PRIVATE)
        self.assertEqual(value['ruby_error_classes'], ['Gem::LoadError'])

    def fixture(self, root, code=42, data=b'unknown private failure'):
        app = root / 'app'; private = root / 'private'; private.mkdir()
        (app / 'ios').mkdir(parents=True)
        (app / 'Gemfile').write_text('root synthetic')
        (app / 'ios/Gemfile').write_text('ios synthetic')
        metadata = app / 'artifacts/native/ios/metadata.json'; metadata.parent.mkdir(parents=True)
        metadata.write_text(json.dumps({'commands': [{'command': COMMAND[:2] + ['BUNDLE_GEMFILE=' + str(app / 'Gemfile')] + COMMAND[2:], 'exit_code': code, 'path': PRIVATE, 'diagnostic': PRIVATE}]}))
        (private / 'command-001.log').write_bytes(data)
        return app, private, metadata

    def test_preserves_exit_code_unknown_size_and_bounded_read(self):
        for code, status in [(0, 'COMPLETED'), (42, 'FAILED'), (124, 'TIMEOUT'), (-15, 'SIGNALED'), (255, 'FAILED'), (True, 'INCOMPLETE'), (256, 'INCOMPLETE')]:
            with tempfile.TemporaryDirectory() as tmp, mock.patch.dict(os.environ, {}, clear=True):
                app, private, _ = self.fixture(Path(tmp), code, PRIVATE.encode())
                result = diagnose.pod_observation(app, private)
                self.assertEqual(result['exit_code'], code if type(code) is int and -128 <= code <= 255 else None)
                self.assertEqual(result['status'], status)
                self.assertEqual(result['log_bytes_capped'], len(PRIVATE))
                self.assertNotIn(PRIVATE, json.dumps(result))
        with tempfile.TemporaryDirectory() as tmp:
            data = b'A' * (diagnose.WINDOW * 3) + b'\nNet::ReadTimeout ' + PRIVATE.encode()
            app, private, _ = self.fixture(Path(tmp), 1, data)
            result = diagnose.pod_observation(app, private)
            self.assertEqual(result['log_window'], 'TRUNCATED')
            self.assertIn('TRANSPORT_TIMEOUT', result['matched_categories'])
            self.assertEqual(result['log_bytes_capped'], len(data))
            self.assertNotIn(PRIVATE, json.dumps(result))

    def test_classification_failure_keeps_command_failure_and_exit_code(self):
        with tempfile.TemporaryDirectory() as tmp:
            app, private, _ = self.fixture(Path(tmp), 42, PRIVATE.encode())
            with mock.patch.object(diagnose, 'classify_pod_text', side_effect=RuntimeError(PRIVATE)):
                result = diagnose.pod_observation(app, private)
            self.assertEqual(result['status'], 'FAILED')
            self.assertEqual(result['exit_code'], 42)
            self.assertEqual(result['log_window'], 'UNAVAILABLE')
            self.assertNotIn(PRIVATE, json.dumps(result))

    def test_exact_command_binding_is_required_and_reported(self):
        with tempfile.TemporaryDirectory() as tmp, mock.patch.dict(os.environ, {}, clear=True):
            app, private, metadata = self.fixture(Path(tmp))
            value = diagnose.pod_observation(app, private)
            self.assertEqual(value['bundle_context']['install_selection'], 'APP_ROOT')
            self.assertEqual(value['bundle_context']['pod_selection'], 'APP_ROOT')
            data = json.loads(metadata.read_text())
            data['commands'][0]['command'][2] = 'BUNDLE_GEMFILE=' + str(app / 'ios/Gemfile')
            metadata.write_text(json.dumps(data))
            self.assertEqual(diagnose.pod_observation(app, private)['status'], 'NOT_OBSERVED')

    def test_missing_symlink_or_malformed_metadata_never_exported(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp); app, private, metadata = self.fixture(root)
            target = root / 'private-data'; target.write_text(PRIVATE)
            log = private / 'command-001.log'; log.unlink(); log.symlink_to(target)
            self.assertEqual(diagnose.pod_observation(app, private)['log_window'], 'UNAVAILABLE')
            metadata.unlink(); metadata.symlink_to(target)
            self.assertEqual(diagnose.pod_observation(app, private)['status'], 'NOT_OBSERVED')
            metadata.unlink(); metadata.write_text(PRIVATE)
            result = diagnose.pod_observation(app, private)
            self.assertEqual(result['status'], 'NOT_OBSERVED')
            self.assertNotIn(PRIVATE, json.dumps(result))

    def test_manifest_search_distinguishes_root_ios_and_override_without_paths(self):
        with tempfile.TemporaryDirectory() as tmp, mock.patch.dict(os.environ, {}, clear=True):
            app, _, _ = self.fixture(Path(tmp))
            expected = {'method': 'STATIC_BUNDLER_2_5_SEARCH', 'gemfile_override': 'ABSENT_OR_EMPTY',
                        'install_selection': 'APP_ROOT', 'pod_selection': 'IOS'}
            self.assertEqual(diagnose.bundle_context(app), expected)
            os.environ['BUNDLE_GEMFILE'] = str(app / 'Gemfile')
            value = diagnose.bundle_context(app)
            self.assertEqual(value['install_selection'], 'APP_ROOT'); self.assertEqual(value['pod_selection'], 'APP_ROOT')
            os.environ['BUNDLE_GEMFILE'] = 'Gemfile'
            value = diagnose.bundle_context(app)
            self.assertEqual(value['install_selection'], 'APP_ROOT'); self.assertEqual(value['pod_selection'], 'IOS')
            os.environ['BUNDLE_GEMFILE'] = '/' + PRIVATE
            value = diagnose.bundle_context(app)
            self.assertEqual(value['pod_selection'], 'OTHER_OR_UNAVAILABLE')
            self.assertNotIn(PRIVATE, json.dumps(value))
            os.environ.pop('BUNDLE_GEMFILE'); (app / 'ios/gems.rb').write_text(PRIVATE)
            self.assertEqual(diagnose.bundle_context(app)['pod_selection'], 'OTHER_OR_UNAVAILABLE')
            (app / 'ios/gems.rb').unlink(); (app / 'ios/Gemfile').unlink()
            self.assertEqual(diagnose.bundle_context(app)['pod_selection'], 'APP_ROOT')
            (app / 'Gemfile').unlink()
            self.assertEqual(diagnose.bundle_context(app)['pod_selection'], 'OTHER_OR_UNAVAILABLE')

    def test_final_guard_and_original_failure_survive_diagnostics(self):
        with tempfile.TemporaryDirectory() as tmp, mock.patch.dict(os.environ, {'RUNNER_TEMP': tmp, 'KEEPER_NATIVE_PLATFORM': 'IOS'}, clear=True):
            root = Path(tmp); app, private, _ = self.fixture(root, 42, b'Bundler::GemNotFound ' + PRIVATE.encode())
            private.rename(root / 'keeper-native-private')
            fake = types.SimpleNamespace(roots=lambda: (app, root, root), guard=mock.Mock())
            harness = types.SimpleNamespace(main=mock.Mock(side_effect=RuntimeError(PRIVATE)))
            spec = types.SimpleNamespace(loader=types.SimpleNamespace(exec_module=mock.Mock()))
            with mock.patch.object(diagnose.importlib.util, 'spec_from_file_location', return_value=spec), \
                 mock.patch.object(diagnose.importlib.util, 'module_from_spec', return_value=harness), \
                 contextlib.redirect_stdout(io.StringIO()) as out:
                self.assertEqual(diagnose.run('prepare', fake, {}), 1)
            record = json.loads(out.getvalue().split(' ', 1)[1])
            self.assertEqual(record['post_prepare_guard'], 'COMPLETED')
            self.assertEqual(fake.guard.call_count, 2)
            self.assertEqual(record['pod']['exit_code'], 42)
            self.assertEqual(record['outcome'], 'FAILED')
            self.assertEqual(record['acceptance'], 'NOT_ACCEPTED')
            self.assertNotIn(PRIVATE, out.getvalue())
            self.assertLess(len(out.getvalue()), 8192)

    def test_all_fixed_categories_fit_emission_bound(self):
        record = diagnose.fixed_record('prepare', 'FAILED')
        record['pod'] = {'matched_categories': [name for name, _ in diagnose.POD_PATTERNS],
                         'ruby_error_classes': list(diagnose.RUBY_ERROR_CLASSES),
                         'lock_section_mentions': list(diagnose.LOCK_SECTIONS)}
        with contextlib.redirect_stdout(io.StringIO()) as out: diagnose.emit(record)
        self.assertEqual(json.loads(out.getvalue().split(' ', 1)[1]), record)
        self.assertNotIn(PRIVATE, out.getvalue())


if __name__ == '__main__':
    unittest.main()
