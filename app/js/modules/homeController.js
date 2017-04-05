;(function(){
    var nb = this.nb;
    var app = nb.app;

    var routeConfig = function($stateProvider) {
        $stateProvider
            .state({
                name: 'home',
                url: '/home',
                templateUrl: '../partials/home.html',
                controller: HomeController,
                controllerAs: 'ctrl'
            });
        }

    app.config(['$stateProvider', routeConfig]);

    var HomeController = function($scope, $rootScope, mockD3TreeData0, mockD3TreeData1) {
        this.$inject = ['$scope', '$rootScope', 'mockD3TreeData0', 'mockD3TreeData1'];
        var zNodes = [
            {name:"test1", open:true, children:[
                {name:"test1_1"}, {name:"test1_2",children:[{name:"test1_2_3"}]}]},
            {name:"test2", open:true, children:[
                {name:"test2_1"}, {name:"test2_2"}]}
         ];

         $scope.dateOptions = {
          changeYear: true,
          changeMonth: true,
          yearRange: '1900:-0',    
        };

        $scope.testCheckbox = true;

        $scope.data=zNodes;
        // 在control上定义方法
        // 通过ctrl调用
        this.clickHandler = function() {
            $scope.treeData = mockD3TreeData1.treeData;
        }
        $scope.people = [
            { name: 'Adam',      email: 'adam@email.com',      age: 12, country: 'United States' },
            { name: 'Amalie',    email: 'amalie@email.com',    age: 12, country: 'Argentina' },
            { name: 'Estefanía', email: 'estefania@email.com', age: 21, country: 'Argentina' },
            { name: 'Adrian',    email: 'adrian@email.com',    age: 21, country: 'Ecuador' },
            { name: 'Wladimir',  email: 'wladimir@email.com',  age: 30, country: 'Ecuador' },
            { name: 'Samantha',  email: 'samantha@email.com',  age: 30, country: 'United States' },
            { name: 'Nicole',    email: 'nicole@email.com',    age: 43, country: 'Colombia' },
            { name: 'Natasha',   email: 'natasha@email.com',   age: 54, country: 'Ecuador' },
            { name: 'Michael',   email: 'michael@email.com',   age: 15, country: 'Colombia' },
            { name: 'Nicolás',   email: 'nicolas@email.com',    age: 43, country: 'Colombia' }
          ];
        $scope.person={};
    }

}());