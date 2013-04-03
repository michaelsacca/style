require 'capybara'
require 'capybara/dsl'
require 'capybara/poltergeist'
require 'pry'
 
Capybara.run_server = false
#removed one of the bangs
headless = !!ENV['HEADLESS']

#Capybara.current_driver = Capybara.javascript_driver = :poltergeist
Capybara.current_driver = :selenium
Capybara.app_host = 'http://localhost'
Capybara.default_wait_time = 15
Capybara.automatic_reload

include Capybara::DSL