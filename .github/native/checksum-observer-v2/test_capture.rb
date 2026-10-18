# Deterministic adapter contract tests; no CocoaPods, app source or native run.
require 'json'
require 'minitest/autorun'
require_relative 'capture'

class CaptureTests < Minitest::Test
  Failure = Class.new(StandardError)
  Lock = Struct.new(:value) do
    def to_hash; value; end
  end
  Root = Struct.new(:name, :defined_in_file) do
    def root; self; end
  end
  Analysis = Struct.new(:specifications)

  def installer_class
    Class.new do
      attr_accessor :lockfile, :candidate, :failure, :analysis_result, :generate_count, :continued
      def generate_lockfile
        self.generate_count += 1
        candidate
      end
      def verify_no_lockfile_changes!
        new_lockfile = generate_lockfile
        return if new_lockfile == lockfile
        raise failure
      end
      def install!
        verify_no_lockfile_changes!
        self.continued = true
      end
    end
  end

  def setup_case(equal: false, sink: nil)
    @rows = []
    @klass = installer_class
    @installer = @klass.new
    @installer.lockfile = Lock.new({'old' => 1})
    @installer.candidate = equal ? @installer.lockfile : Lock.new({'new' => 2})
    @installer.failure = Failure.new('PRIVATE_ORIGINAL_EXCEPTION')
    @installer.analysis_result = Analysis.new([Root.new('Fixture', '/safe/fixture.json')])
    @installer.generate_count = 0
    @installer.continued = false
    @phase = 0
    snapshot = -> { @phase += 1; {'phase' => @phase, 'json' => JSON::VERSION, 'ruby' => RUBY_VERSION} }
    @observer = KeeperChecksumObserver::Observer.new(
      installer_class: @klass,
      expected_path: @klass.instance_method(:verify_no_lockfile_changes!).source_location.first,
      source_sha: 'a' * 40, identity: {'attempt' => 1},
      sink: sink || ->(record) { @rows << record }, snapshotter: snapshot
    ).attach!
  end

  def test_changed_preserves_same_exception_and_compared_objects
    setup_case
    error = assert_raises(Failure) { @installer.install! }
    assert_same @installer.failure, error
    assert_equal @installer.lockfile.value, @rows.first['old_lock']
    assert_equal @installer.candidate.value, @rows.first['new_lock']
    assert_equal 'FAILED', @rows.first['comparison']
    assert_equal 1, @installer.generate_count
    refute @installer.continued
  end

  def test_equality_stops_before_integration
    setup_case(equal: true)
    assert_raises(KeeperChecksumObserver::StopAfterComparison) { @installer.install! }
    assert_equal 'EQUAL', @rows.first['comparison']
    assert_equal 1, @installer.generate_count
    refute @installer.continued
  end

  def test_sink_failure_does_not_mask_original_exception
    setup_case(sink: ->(_) { raise 'PRIVATE_SINK_ERROR' })
    assert_same @installer.failure, assert_raises(Failure) { @installer.install! }
    assert_equal 'INCOMPLETE', @observer.capture_status
    refute @installer.continued
  end

  def test_sink_failure_on_equality_still_stops
    setup_case(equal: true, sink: ->(_) { raise 'PRIVATE_SINK_ERROR' })
    assert_raises(KeeperChecksumObserver::StopAfterComparison) { @installer.install! }
    refute @installer.continued
  end

  def test_second_comparison_does_not_resolve_again
    setup_case
    assert_raises(Failure) { @installer.install! }
    assert_raises(KeeperChecksumObserver::StopAfterComparison) { @installer.install! }
    assert_equal 1, @installer.generate_count
    assert_equal 1, @rows.length
  end

  def test_both_snapshots_use_same_process_and_late_state
    setup_case
    assert_raises(Failure) { @installer.install! }
    assert_equal [1, 2], @rows.first['runtime'].map { |r| r['phase'] }
    assert_equal [JSON::VERSION, JSON::VERSION], @rows.first['runtime'].map { |r| r['json'] }
  end

  def test_wrong_source_method_rejected
    klass = installer_class
    assert_raises(KeeperChecksumObserver::InvalidCapture) do
      KeeperChecksumObserver::Observer.new(installer_class: klass, expected_path: '/wrong/path',
        source_sha: 'a' * 40, identity: {'attempt' => 1}, sink: ->(_) {}, snapshotter: -> { {} })
    end
  end

  def test_missing_generated_object_retains_failure
    setup_case
    @installer.define_singleton_method(:generate_lockfile) { raise failure }
    assert_same @installer.failure, assert_raises(Failure) { @installer.install! }
    assert_equal 'INCOMPLETE', @observer.capture_status
    assert_empty @rows
  end

  def test_trace_callback_failure_does_not_replace_original_exception
    setup_case
    @observer.define_singleton_method(:read_compared_lock) { |_| raise 'PRIVATE_TRACE_ERROR' }
    assert_same @installer.failure, assert_raises(Failure) { @installer.install! }
    assert_equal 'INCOMPLETE', @observer.capture_status
    assert_empty @rows
    refute @installer.continued
  end

  def test_pipe_payload_rejects_unbounded_and_custom_values_before_serialization
    assert KeeperChecksumObserver.validate_payload({'safe' => [1, true, nil]})
    assert_raises(KeeperChecksumObserver::InvalidCapture) { KeeperChecksumObserver.validate_payload({'private' => Object.new}) }
    assert_raises(KeeperChecksumObserver::InvalidCapture) { KeeperChecksumObserver.validate_payload({'private' => 'x' * 16_385}) }
    recursive = []; recursive << recursive
    assert_raises(KeeperChecksumObserver::InvalidCapture) { KeeperChecksumObserver.validate_payload(recursive) }
  end
end
