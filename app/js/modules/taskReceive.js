;(function(){
    var nb = this.nb;
    var app = nb.app;

    var routeConfig = function($stateProvider) {
        $stateProvider
            .state({
                name: 'taskReceive',
                url: '/taskReceive',
                templateUrl: '../partials/taskReceive/taskReceive.html',
                controller: taskReceiveController,
                controllerAs: 'ctrl'
            });
        }

    app.config(['$stateProvider', routeConfig]);

    app.value('defaultValue', {
        config1: true,
        config2: "Default config2 but it can changes"
        });

    var taskReceiveController = function($scope, $rootScope, $http, $state) {
        this.$inject = ['$scope', '$rootScope', '$http', '$state'];

        this.createTask = function(task){
          $http.get("/api/orders")
          .then(function(response){
              console.log(response);
            }
          );
          $state.go('home');
        }

    }

}());