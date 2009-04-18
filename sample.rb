Merb::Router.prepare { default_routes }

class Awesome < Merb::Controller
  def index
    sleep 1
    "Hello dynamic #{request.env["PATH_INFO"]}"
  end
end