# Synthetic installer fixture for the real Ruby -> Python private pipe.
# Never loads an app Podfile or claims CocoaPods integration.
require 'json'
require_relative 'capture'

input_path, policy_path, python, processor, status_path, mode = ARGV
input = JSON.parse(File.binread(input_path))
Lock = Struct.new(:value) do
  def to_hash; value; end
end
Root = Struct.new(:name, :defined_in_file) do
  def root; self; end
end
Analysis = Struct.new(:specifications)
FixtureFailure = Class.new(StandardError)
class TransportInstaller
  attr_accessor :lockfile, :candidate, :failure, :analysis_result, :generate_count
  def generate_lockfile
    self.generate_count += 1
    candidate
  end
  def verify_no_lockfile_changes!
    new_lockfile = generate_lockfile
    return if new_lockfile == lockfile
    raise failure
  end
end

installer = TransportInstaller.new
installer.lockfile = Lock.new(input.fetch('old_lock'))
installer.candidate = Lock.new(input.fetch('new_lock'))
installer.failure = FixtureFailure.new('PRIVATE_ORIGINAL_TRANSPORT_ERROR')
installer.analysis_result = Analysis.new(input.fetch('specs').map { |r| Root.new(r.fetch('name'), r.fetch('path')) })
installer.generate_count = 0
phase = 0
snapshots = input.fetch('runtime')
snapshotter = if mode == 'real_runtime'
                nil
              else
                -> { value = snapshots.fetch(phase); phase += 1; value }
              end
observer = KeeperChecksumObserver::Observer.new(
  installer_class: TransportInstaller, expected_path: __FILE__,
  source_sha: input.fetch('source_sha'), identity: input.fetch('identity'),
  sink: KeeperChecksumObserver.pipe_sink(python: python, processor: processor, policy: policy_path),
  snapshotter: snapshotter
).attach!
status = {'continued' => false, 'original_preserved' => false, 'stopped_on_equality' => false}
begin
  installer.verify_no_lockfile_changes!
  status['continued'] = true
rescue FixtureFailure => error
  status['original_preserved'] = error.equal?(installer.failure)
rescue KeeperChecksumObserver::StopAfterComparison
  status['stopped_on_equality'] = true
end
status['capture_status'] = observer.capture_status
status['generate_count'] = installer.generate_count
File.binwrite(status_path, JSON.generate(status))
