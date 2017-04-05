;(function(){
    var nb = {};
    this.nb = nb;
    // appModule的依赖
    var deps = [
        'ui.router',
        'ngMaterial',
        'nb.directives',
        'restangular',
        'ngAnimate',
        'ngMessages',
        'nb.resources',
        /*'ui.select',
        'ngSanitize',
        'ui.date'*/
    ];

    // 数据资源模块
    var resources = angular.module('nb.resources', []);

    // 自动启动app
    var app = angular.module('nb', deps);

    app.value('mode', 'app');
    app.value('version', '0.1.1');
    app.filter('propsFilter', function() {
      return function(items, props) {
        var out = [];

        if (angular.isArray(items)) {
          var keys = Object.keys(props);
            
          items.forEach(function(item) {
            var itemMatches = false;

            for (var i = 0; i < keys.length; i++) {
              var prop = keys[i];
              var text = props[prop].toLowerCase();
              if (item[prop].toString().toLowerCase().indexOf(text) !== -1) {
                itemMatches = true;
                break;
              }
            }

            if (itemMatches) {
              out.push(item);
            }
          });
        } else {
          // Let the output be the input untouched
          out = items;
        }

        return out;
      };
    });

    nb.app = app;

    // 路由配置函数
    var routeConf = function($stateProvider, $urlRouterProvider, $locationProvider, $httpProvider) {
        this.$inject = ['$stateProvider', '$urlRouterProvider', '$locationProvider', '$httpProvider']

        $urlRouterProvider.otherwise('home');
    }

    // material主题色盘配置
    var themeConf = function($mdThemingProvider) {
        $mdThemingProvider.theme('default')
            .primaryPalette('blue', {
                'hue-1': '100',
                'hue-2': '200',
                'hue-3': '300',
            })
            .accentPalette('pink')
            .warnPalette('red')
    }

    // 路由配置
    app.config(['$stateProvider', '$urlRouterProvider', '$locationProvider', '$httpProvider', routeConf]);
    // 主题配置
    app.config(['$mdThemingProvider', themeConf]);

    // app启动执行函数
    app.run(['$rootScope', '$state', function($rootScope, $state) {
        // 提供跨会话跳转的函数
        window.travelThrough = function(state) {
            $state.go(state);
        }
    }]);

}).call(this);