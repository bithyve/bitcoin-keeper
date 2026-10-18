import copy
import json
import unittest
import provenance

def fixture(platform):
    digest = 'a' * 64
    rows = [{'kind': kind, 'status': 200, 'bytes': 4096, 'sha256': digest} for kind in ['warmup', 'served']]
    bundle = {'result': 'PASS', 'http_status': 200, 'bytes': 4096, 'sha256': digest}
    ios = platform == 'IOS'
    config = ['.env.ci', 'firebase.json'] + (['ios/GoogleService-Info.plist', 'ios/GoogleServices/dev/GoogleService-Info.plist']
                                           if ios else ['android/app/google-services.json'])
    return {'runner': {'RUNNER_OS': 'macOS' if ios else 'Linux', 'RUNNER_ARCH': 'ARM64' if ios else 'X64',
                       'ImageOS': 'macos15' if ios else 'ubuntu24', 'ImageVersion': '20261012.1.0'},
            'maestro': {'version':'cli-2.11.0','sha256':'5384593cb4e7a106489e75a821d157dd43f4e438df6bc308b72e82c685e1283a'},
            'nodeify_overlay': {**{key: digest for key in ['before_sha256','after_sha256','diff_sha256']},
                               'allowed_fields':['browser','react-native','browserify']},
            'configuration_overlays':[{'path':path,'sha256':digest} for path in config],
            'metro_warmup':bundle, 'startup_probe':{'served_bundles':rows},
            'bridge_probe': {'bundle':bundle, 'served_bundles':rows,
                'runtime': {'device_type':'com.apple.CoreSimulator.SimDeviceType.iPhone-16',
                    'runtime_id':'com.apple.CoreSimulator.SimRuntime.iOS-18-5','runtime_version':'18.5','runtime_build':'22F76'} if ios else
                    {'api':'35','abi':'x86_64','system_image':{'AndroidVersion.ApiLevel':'35','Pkg.Revision':'9'}}},
            'toolchain': {'xcode':'Xcode 16.4\nBuild version 16F6', 'ios_simulator_architecture':'arm64'} if ios else {'observed_android_sdk': {
                'platforms/android-36': {'Pkg.Revision':'2','AndroidVersion.ApiLevel':'36'},
                'build-tools/35.0.0':{'Pkg.Revision':'35.0.0'}, 'ndk/27.1.12297006':{'Pkg.Revision':'27.1.12297006'}}}}

class DurableRecords(unittest.TestCase):
    def test_both_platforms_and_integer_sdk_revisions(self):
        for platform in ['IOS','ANDROID']:
            record=provenance.select(fixture(platform),platform,7)
            self.assertEqual(record['retention_days'],7)
            self.assertEqual(len(record['served_bundles']),2)
        self.assertEqual(provenance.select(fixture('ANDROID'),'ANDROID',7)['device']['image_revision'],'9')

    def test_missing_or_wrong_identity_and_retention_block(self):
        data=fixture('IOS')
        for retention in [0,91,True,'7']:
            with self.subTest(retention=retention),self.assertRaises(ValueError):
                provenance.select(data,'IOS',retention)
        for path,value in [(('runner','RUNNER_ARCH'),'X64'),(('runner','ImageVersion'),'private-text'),
                           (('maestro','sha256'),'b'*64),(('toolchain','xcode'),'Xcode 16.4\nBuild version private')]:
            changed=copy.deepcopy(data);changed[path[0]][path[1]]=value
            with self.subTest(path=path),self.assertRaises(ValueError): provenance.select(changed,'IOS',7)

    def test_warmup_only_failed_empty_or_unbounded_bundles_block(self):
        for rows in [[], [{'kind':'warmup','status':200,'bytes':3,'sha256':'a'*64}],
                     [{'kind':kind,'status':500,'bytes':3,'sha256':'a'*64} for kind in ['warmup','served']],
                     fixture('IOS')['startup_probe']['served_bundles']*5]:
            data=fixture('IOS');data['startup_probe']['served_bundles']=rows
            with self.subTest(rows=rows),self.assertRaises(ValueError): provenance.select(data,'IOS',7)

    def test_arbitrary_metadata_and_private_values_cannot_export(self):
        marker='PRIVATE_SYNTHETIC_RECOVERY_PATH_TEXT'
        data=fixture('IOS');data['private']=marker;data['runner']['extra']=marker
        self.assertNotIn(marker,json.dumps(provenance.select(data,'IOS',7)))
        for mutate in [lambda d:d['configuration_overlays'][0].update(path=marker),
                       lambda d:d['startup_probe']['served_bundles'][0].update(sha256=marker),
                       lambda d:d['bridge_probe']['runtime'].update(runtime_build=marker)]:
            changed=copy.deepcopy(data);mutate(changed)
            with self.assertRaises(ValueError):provenance.select(changed,'IOS',7)

if __name__=='__main__':unittest.main()
