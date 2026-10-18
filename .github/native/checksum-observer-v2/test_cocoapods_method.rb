# SOURCE-FRAGMENT FIXTURES ONLY. Executes one unchanged, checksum-pinned method
# from the retained CocoaPods gem with explicit synthetic collaborators.
# Does not require/activate CocoaPods, load an app Podfile, or resolve dependencies.
require 'json'
require 'digest'
require 'minitest/autorun'
require_relative 'capture'

SOURCE_PATH = File.expand_path(ENV.fetch('KEEPER_COCOAPODS_INSTALLER_SOURCE')).freeze
SOURCE_SHA256 = 'a29597f2fa5d1f11e76511689c7ac91ecd0411c67390db07c8b057628fb18fda'.freeze
SOURCE_LINE = 489
source_bytes = File.binread(SOURCE_PATH)
raise 'SOURCE_FRAGMENT_IDENTITY_MISMATCH' unless Digest::SHA256.hexdigest(source_bytes) == SOURCE_SHA256
SOURCE_FRAGMENT = source_bytes.lines[SOURCE_LINE - 1, 10].join.freeze
raise 'SOURCE_FRAGMENT_BOUNDARY_MISMATCH' unless SOURCE_FRAGMENT.lines.first.strip == 'def verify_no_lockfile_changes!' &&
                                                SOURCE_FRAGMENT.lines.last.strip == 'end'
raise 'FULL_PACKAGE_NOT_EXPECTED' if defined?(Pod::Installer)

# The upstream method decorates a literal String using colored2. This process-
# local fixture collaborator supplies only that decoration; no package activation.
class String
  def yellow; self; end
end

class CocoaPodsSourceFragmentTests < Minitest::Test
  Lock = Struct.new(:value) do
    def to_hash; value; end
  end
  Lock.const_set(:HASH_KEY_ORDER, ['marker'].freeze)
  Root = Struct.new(:name, :defined_in_file) do
    def root; self; end
  end
  Analysis = Struct.new(:specifications)

  def setup_case(equal: false, nil_diff: false)
    @records = []
    @diff_calls = 0
    @klass = Class.new do
      attr_accessor :lockfile, :candidate, :analysis_result, :generate_count, :continued
      def generate_lockfile
        self.generate_count += 1
        candidate
      end
      def run_boundary!
        verify_no_lockfile_changes!
        self.continued = true
      end
    end
    @klass.const_set(:Informative, Class.new(StandardError))
    @klass.const_set(:Lockfile, Lock)
    xcodeproj = Module.new
    differ = Module.new
    differ.define_singleton_method(:hash_diff) do |*|
      @fixture_callback.call
    end
    differ.instance_variable_set(:@fixture_callback, -> { @diff_calls += 1; nil_diff ? nil : {'marker' => 'synthetic diff'} })
    xcodeproj.const_set(:Differ, differ)
    @klass.const_set(:Xcodeproj, xcodeproj)
    yaml_helper = Module.new
    yaml_helper.define_singleton_method(:convert_hash) { |*| ':diff: synthetic fixture' }
    @klass.const_set(:YAMLHelper, yaml_helper)
    # Preserve the genuine file path and line number for the adapter's matching
    # and TracePoint binding. No byte of the method fragment is rewritten.
    @klass.class_eval(SOURCE_FRAGMENT, SOURCE_PATH, SOURCE_LINE)
    @installer = @klass.new
    @installer.lockfile = Lock.new({'marker' => 'old'})
    @installer.candidate = Lock.new({'marker' => equal ? 'old' : 'new'})
    @installer.analysis_result = Analysis.new([Root.new('Synthetic', '/synthetic/fixture.json')])
    @installer.generate_count = 0
    @installer.continued = false
    phase = 0
    @observer = KeeperChecksumObserver::Observer.new(
      installer_class: @klass, expected_path: SOURCE_PATH, source_sha: 'a' * 40,
      identity: {'attempt' => 1}, sink: ->(capture) { @records << capture },
      snapshotter: -> { phase += 1; {'synthetic_phase' => phase} }
    ).attach!
  end

  def assert_boundary(outcome)
    refute @installer.continued
    assert_equal 1, @installer.generate_count
    assert_equal 1, @records.length
    assert_equal outcome, @records.first['comparison']
    assert_equal @installer.lockfile.to_hash, @records.first['old_lock']
    assert_equal @installer.candidate.to_hash, @records.first['new_lock']
    assert_equal 'CAPTURED', @observer.capture_status
  end

  def test_real_method_changed_path_preserves_the_original_exception
    setup_case
    original = nil
    trace = TracePoint.new(:raise) do |event|
      if event.defined_class == @klass && event.method_id == :verify_no_lockfile_changes! && event.path == SOURCE_PATH
        original = event.raised_exception
      end
    end
    caught = trace.enable { assert_raises(@klass.const_get(:Informative)) { @installer.run_boundary! } }
    assert_same original, caught
    assert_equal 1, @diff_calls
    assert_boundary('FAILED')
    assert_raises(KeeperChecksumObserver::StopAfterComparison) { @installer.run_boundary! }
    assert_equal 1, @installer.generate_count
  ensure
    trace&.disable
  end

  def test_real_method_equal_path_stops_before_continuation
    setup_case(equal: true)
    assert_raises(KeeperChecksumObserver::StopAfterComparison) { @installer.run_boundary! }
    assert_equal 0, @diff_calls
    assert_boundary('EQUAL')
  end

  def test_real_method_nil_diff_return_still_stops_and_records_actual_objects
    setup_case(nil_diff: true)
    refute_equal @installer.lockfile, @installer.candidate
    assert_raises(KeeperChecksumObserver::StopAfterComparison) { @installer.run_boundary! }
    assert_equal 1, @diff_calls
    assert_boundary('EQUAL')
    # EQUAL with unequal hashes is deliberately retained, not relabeled a pass.
    # The independent Python contradiction regression verifies its rejection.
    refute_equal @records.first['old_lock'], @records.first['new_lock']
  end
end
