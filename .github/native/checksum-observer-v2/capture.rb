# Same-process CocoaPods comparison adapter. Load only after CocoaPods has loaded
# JSON normally. No gem selection, dependency evaluation, file reads or network.
# This is a diagnostic boundary: the original comparison always runs once; its
# exception survives unchanged, and equality stops before subsequent integration.
require 'digest'
require 'rbconfig'

module KeeperChecksumObserver
  class StopAfterComparison < StandardError
    def initialize
      super('DIAGNOSTIC_STOP_AFTER_COMPARISON')
    end
  end

  class InvalidCapture < StandardError
    def initialize
      super('OBSERVER_CAPTURE_INCOMPLETE')
    end
  end

  FIXTURE = {'array' => [], 'object' => {}, 'nested' => [[], {}], 'text' => '[] {} " \\'} .freeze
  GEMS = %w[cocoapods cocoapods-core json xcodeproj activesupport claide].freeze

  def self.snapshot(installer_path)
    raise InvalidCapture unless defined?(JSON) && defined?(JSON::VERSION)
    backend_name = JSON.generator.name
    backend = if backend_name.start_with?('JSON::Ext') then 'C'
              elsif backend_name.start_with?('JSON::Pure') then 'PURE'
              else 'OTHER' end
    candidates = $LOADED_FEATURES.select { |path| path.match?(%r{/json/(?:ext/generator\.(?:so|bundle)|pure/generator\.rb)\z}) }
    raise InvalidCapture unless candidates.length == 1
    ruby_json_path = JSON.method(:pretty_generate).source_location&.first
    raise InvalidCapture unless ruby_json_path
    arch = RbConfig::CONFIG['host_cpu']
    {
      'ruby' => RUBY_VERSION, 'engine' => RUBY_ENGINE, 'patchlevel' => RUBY_PATCHLEVEL,
      'arch' => arch.match?(/\A(?:aarch64|arm64)\z/) ? 'ARM64' : arch.match?(/\Ax86_64\z/) ? 'X86_64' : 'OTHER',
      'gems' => GEMS.to_h { |name| [name, Gem.loaded_specs[name]&.version&.to_s] },
      'json_version' => JSON::VERSION, 'backend' => backend,
      'fingerprint' => Digest::SHA256.hexdigest(JSON.pretty_generate(FIXTURE) + "\n"),
      'files' => {'ruby' => RbConfig.ruby, 'installer' => installer_path,
                  'json_ruby' => ruby_json_path, 'json_backend' => candidates.first}
    }
  end

  class Observer
    attr_reader :capture_status

    # The caller must pre-verify the immutable installer/toolchain manifest and
    # keep all repository provenance gates. expected_path is an exact association,
    # not permission to read a path. Python validates every path before reading.
    def initialize(installer_class:, expected_path:, source_sha:, identity:, sink:, snapshotter: nil)
      @klass = installer_class
      @expected_path = expected_path
      @source_sha = source_sha
      @identity = identity
      @sink = sink
      @snapshotter = snapshotter || -> { KeeperChecksumObserver.snapshot(@expected_path) }
      @used = false
      @capture_status = 'NOT_OBSERVED'
      @method = @klass.instance_method(:verify_no_lockfile_changes!)
      raise InvalidCapture unless @method.owner == @klass && @method.source_location&.first == expected_path
      @initial_snapshot = @snapshotter.call
    end

    def attach!
      observer = self
      wrapper = Module.new do
        define_method(:verify_no_lockfile_changes!) do
          observer.compare(self) { super() }
        end
      end
      @klass.prepend(wrapper)
      self
    end

    def compare(installer)
      raise StopAfterComparison if @used
      @used = true
      @captured = nil
      @capture_fault = false
      trace = TracePoint.new(:raise, :return) do |event|
        begin
          next unless event.defined_class == @klass && event.method_id == :verify_no_lockfile_changes!
          next unless event.path == @expected_path && event.self.equal?(installer)
          value = read_compared_lock(event)
          @captured = value if value && !@capture_fault
        rescue Exception
          # Instrumentation must not replace an exception being raised by the
          # original comparison, including binding/TracePoint failures.
          @capture_fault = true
          @captured = nil
        end
      end
      begin
        trace.enable { yield }
      rescue Exception # preserve the exact original exception, including interruption
        trace.disable
        emit(installer, 'FAILED')
        raise
      else
        trace.disable
        emit(installer, 'EQUAL')
        raise StopAfterComparison
      ensure
        trace.disable
      end
    end

    private

    def read_compared_lock(event)
      binding = event.binding
      binding.local_variable_get(:new_lockfile) if binding.local_variable_defined?(:new_lockfile)
    end

    def emit(installer, outcome)
      raise InvalidCapture unless @captured && !@capture_fault
      roots = {}
      specs = installer.analysis_result.specifications
      raise InvalidCapture unless specs.is_a?(Array) && specs.length <= 4096
      specs.each do |spec|
        root = spec.root
        name, path = root.name, root.defined_in_file.to_s
        raise InvalidCapture unless name.is_a?(String) && name.bytesize <= 256 && path.bytesize <= 4096
        raise InvalidCapture if roots.key?(name) && roots[name] != path
        roots[name] = path
      end
      capture = {
        'source_sha' => @source_sha,
        'identity' => @identity,
        'old_lock' => installer.lockfile.to_hash,
        'new_lock' => @captured.to_hash,
        'specs' => roots.map { |name, path| {'name' => name, 'path' => path} },
        'runtime' => [@initial_snapshot, @snapshotter.call],
        'comparison' => outcome
      }
      @sink.call(capture)
      @capture_status = 'CAPTURED'
    rescue Exception
      # No error text, source path or raw capture is printed by this adapter.
      # A missing terminal envelope is consumer-detected INCOMPLETE. The original
      # comparison failure (or equality sentinel) still controls the caller.
      @capture_status = 'INCOMPLETE'
    end
  end

  # Local private pipe only. The processor emits fixed bounded records. It must
  # be manifest-verified by the caller before use; no shell interpolation occurs.
  def self.validate_payload(value)
    pending = [[value, 0]]
    nodes = 0
    bytes = 0
    until pending.empty?
      item, depth = pending.pop
      nodes += 1
      raise InvalidCapture if nodes > 100_000 || depth > 64
      case item
      when Hash
        raise InvalidCapture if item.length > 4096
        item.each do |key, child|
          raise InvalidCapture unless key.is_a?(String)
          pending << [key, depth + 1] << [child, depth + 1]
        end
      when Array
        raise InvalidCapture if item.length > 4096
        item.each { |child| pending << [child, depth + 1] }
      when String
        bytes += item.bytesize
        raise InvalidCapture if item.bytesize > 16_384 || bytes > 2 * 1024 * 1024
      when Integer, TrueClass, FalseClass, NilClass
        # Fixed capture types; arbitrary objects/custom to_json are prohibited.
      else
        raise InvalidCapture
      end
    end
    true
  end

  def self.pipe_sink(python:, processor:, policy:)
    lambda do |capture|
      validate_payload(capture)
      bytes = JSON.generate(capture)
      raise InvalidCapture if bytes.bytesize > 2 * 1024 * 1024
      IO.popen([python, '-B', processor, '--policy', policy], 'w', err: File::NULL) { |pipe| pipe.write(bytes) }
      raise InvalidCapture unless $?.success?
    end
  end
end
