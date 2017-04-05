;(function(){
    var nb = this.nb;
    var app = nb.app;

    var routeConfig = function($stateProvider) {
        $stateProvider
            .state({
                name: 'taskBreakDown',
                url: '/taskBreakDown',
                templateUrl: '../partials/taskAnalysis/taskBreakDown.html',
                controller: taskBreakDownController,
                controllerAs: 'ctrl'
            });
        }

    app.config(['$stateProvider', routeConfig]);

    var taskBreakDownController = function($scope, $rootScope, $q, $timeout, $http) {
        this.$inject = ['$scope', '$rootScope', '$q', '$timeout', '$http'];

        $scope.editing = false;
        $scope.currentTaskPlan = null;
        $scope.treeData = null;

        getTasksTreeData();

        this.getCurrentTaskPlan = function(plan) {
            $http.get('/api/task_break_down/plans/' + plan.id).then(function(data) {
                $scope.currentTaskPlan = data.data;
            });
        }

        this.getCurrentTaskPlanTreeData = function(plan) {
            $http.get('/api/task_break_down/plans_tree/' + plan.id).then(function(data) {
                $scope.treeData = data.data;
            });
        }

        this.saveCurrentTaskPlanTreeData = function(plan) {
            var newTreeData = $scope.treeData;

            $http.put('/api/task_break_down/plans_tree/' + plan.id, newTreeData).then(function(msg) {
                console.log("保存成功");
            });
        }

        $scope.trunks = [
            {
                name: "方案1"
            },
            {
                name: "方案2"
            },
            {
                name: "方案3"
            }
        ];

        $scope.leafs = [
            {
                name: "目标1"
            },
            {
                name: "目标2"
            },
            {
                name: "目标3"
            },
            {
                name: "目标1"
            },
            {
                name: "目标2"
            },
            {
                name: "目标3"
            },
            {
                name: "2017-12-25",
                dataType: "date"
            }
        ];

        $scope.tools = [
            {
                name: "工具1"
            },
            {
                name: "工具2"
            },
            {
                name: "工具3"
            }
        ];


        $scope.test={display:"任务四",value:"10004"};
        $scope.test2="";

        $scope.$watch('test2',function(newVal,oldVal){
            console.log(newVal);
        });

        $scope.roots = [
                        {id:"10001",name:"高级"},
                        {id:"10002",name:"中级"},
                        {id:"10003",name:"低级"}
                       ];

        $scope.levels = [
                        {id:"10001",name:"高级"},
                        {id:"10002",name:"中级"},
                        {id:"10003",name:"低级"}
                       ];

        $scope.planQueryTypes=[
                        {name:"名字",value:"name"},
                        {name:"ID",value:"id"},
                        {name:"秘级",value:"level"}
                        ];

        $scope.planQueryText="";
        $scope.planQueryType="name";
        $scope.querySearchTreeData=querySearchTreeData;
        $scope.checkNodes=[]
        var self = this;
            getTasks();
            getSchemes();
            getAlocationSchemes();
            getOrganizations();
            self.task    = null;
            self.scheme    = null;
            self.alocationScheme    = null;
            self.organization=null;
            self.selectedTask  = null;
            self.selectedSchemes = null;
            self.selectedAlocationSchemes = null;
            self.selectedOrganization=null;
            self.querySearch   = querySearch;


        function querySearch (query,array) {
            var results = query ? array.filter( createFilterFor(query) ) : array;
            var deferred = $q.defer();
            $timeout(function () { deferred.resolve( results ); }, Math.random() * 1000, false);
            return deferred.promise;
        }

        function createFilterFor(query) {
            var lowercaseQuery = angular.lowercase(query);
            return function filterFn(state) {
                return (state.display.indexOf(lowercaseQuery) === 0);
            };
        }

        function getTasksTreeData() {
            $http.get('/api/task_break_down/plans').then(function(data) {
                $scope.tasksTreeData = data.data;
                $scope.tasksTreeDataCopy=data.data;
            });
        }

        $scope.deleteScheme=deleteScheme;

        function deleteScheme(id,array){
            id = id || $scope.chooseNode.id;
            array = array || $scope.tasksTreeData;
            for (var i = 0; i < array.length; i++) {
                if(id==array[i].id){
                    array.splice(i,1);
                    return;
                }else{
                    if(array[i].children&&array[i].children.length>0){
                       deleteScheme(id,array[i].children);
                    }
                }
            }
        }

        function getTasks(){
            $http.get('/api/task_break_down/plans_tasks').then(function(data){
                self.tasks=data.data;
                $scope.tasks=data.data;
                console.log($scope.tasks);
            });
        }

        function getSchemes(){
            $http.get('/api/task_break_down/plans_schemes').then(function(data){
                self.schemes=data.data;
            });
        }

        function getAlocationSchemes(){
            $http.get('/api/task_break_down/plans_alocationSchemes').then(function(data){
                self.alocationSchemes=data.data;
            });
        }

         function getOrganizations(){
            $http.get('/api/organization').then(function(data){
                self.organizations=data.data;
            });
        }

        function querySearchTreeData(planQueryType,planQueryText){
            planQueryType=planQueryType||"name";
            var results=[];
            for (var i = 0; i < $scope.tasksTreeDataCopy.length; i++) {
                if($scope.tasksTreeDataCopy[i][planQueryType].indexOf(planQueryText)>-1){
                    results.push($scope.tasksTreeDataCopy[i]);
                }
            }
            $scope.tasksTreeData=results;
        }

        $scope.save=function(){
            alert("ttttttt");
        }
    }

}());