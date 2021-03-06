require "builder/task_base"

module Builder
  class Config < Builder::TaskBase
    CONFIG_FILENAME = 'AppConfig.js'

    public
    def build
      @destination = File.join(@location, CONFIG_FILENAME)
      File.open(@destination, 'w') { |f| f.write config }
      true
    end

    def report
      {
        :location   => @location,
        :files      => [ CONFIG_FILENAME ]
      }
    end

    private
    def config
      os = @target['device_os'] || 'ios'
      type = @target['device_type'] || 'phone'
      browser = %w{browser MAP}.include? @target['build_type']
      env = 'production'
      debug = false

      if @target['development']
        env = 'development'
        debug = true
      end

      if @target['device_os'].nil? || @target['device_type'].nil?
        @build.log("Using default device types", 'warning')
      end

      settings = @build.build_helper.config_settings.merge({
        'debug'               => debug,
        'environment'         => env,
        'skip_version_check'  => browser
      })

      # don't provide device config info for browser builds
      if (@build_type == 'browser')
        os = nil
        type = nil
      end

      Mulberry::Framework::Generators.config(os, type, settings)
    end

  end

end
