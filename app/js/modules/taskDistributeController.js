;(function(){
    var nb = this.nb;
    var app = nb.app;

    var routeConfig = function($stateProvider) {
        $stateProvider
            .state({
                name: 'taskDistribute',
                url: '/taskDistribute',
                templateUrl: '../partials/taskAnalysis/taskDistribute.html',
                controller: taskDistributeController,
                controllerAs: 'ctrl'
            });
        }

    app.config(['$stateProvider', routeConfig]);
    
    var taskDistributeController = function($scope, $http, $rootScope, mockD3TreeData0, mockD3TreeData1, $q, $timeout) {
        this.$inject = ['$scope', '$http', '$rootScope', 'mockD3TreeData0', 'mockD3TreeData1', '$q', '$timeout'];
        $scope.treeData = mockD3TreeData0.treeData;
        $scope.searchDisable = true;
        
        $http.get('/api/task_distribute/task_zTree').then(function(res) {
            NodeData = res.data;
            $scope.zNodeData = NodeData;
            var thisStr = JSON.stringify(NodeData)
            window.localStorage.setItem("nodeData", thisStr);
        });
        $http.get('/api/task_distribute/task_zTree_right').then(function(res) {
            $scope.rightNodeData = res.data;
        });

        //联想输入框配置
        var self = this;
        getAjaxData('/api/task_distribute/task_level', 'levels');
        getAjaxData('/api/task_distribute/task_root', 'roots');
        getAjaxData('/api/task_break_down/plans_tasks', 'tasks');
        getAjaxData('/api/task_break_down/plans_schemes', 'schemes');
        getAjaxData('/api/task_break_down/plans_alocationSchemes', 'alocationSchemes');
        getAjaxData('/api/organization', 'organizations');
        //设定表单初始值
        $scope.currentTaskPlan = {
            "name": '攻击哈哈',
            "root": '1',
            "level": '2',
            "task": '任务一',
            "scheme": '方案一',
            "alocationScheme": '分配方案一',
            "createPeople": '小强强',
            "organization": '单位一',
            "describtion":'asdasfdsff',
            "selectedTask": null,
            "selectedSchemes": null,
            "selectedAlocationSchemes": null,
            "selectedOrganizations": null
        };
        //设定增加的表单初始值
        $scope.addTaskPlan = {

        };
        //ztree
        $scope.checkNodesData = [];
        $scope.chooseNodeData = [];
        //联想框方法
        self.querySearch = querySearch;
        function querySearch (query,array) {
            var results = query ? array.filter( createFilterFor(query) ) : array;
            var deferred = $q.defer();
            $timeout(function () { deferred.resolve( results ); }, Math.random() * 1000, false);
            return deferred.promise;
        }
        //过滤的方法
        function createFilterFor(query) {
            var lowercaseQuery = angular.lowercase(query);
            return function filterFn(state) {
                return (state.display.indexOf(lowercaseQuery) === 0);
            };
        }
        //获取数据的方法
        function getAjaxData(url, destination) {
            $http.get(url).then(function(res) {
                self[destination] = res.data;
                $scope[destination] = res.data;
            });
        }
       //点击搜索事件
        this.searchTask = function() {
            var nodeData = JSON.parse(localStorage.getItem("nodeData"));
            var searchVal = $scope.searchValue || "";
            if(searchVal){
                _.remove(nodeData, function(item) {
                    item.open = true; 
                    _.remove(item.children, function(thisItem) {
                        return !(thisItem.name.indexOf(searchVal) + 1);
                    });
                    return !item.children.length;
                })
            }
            else{
                return $scope.zNodeData = nodeData;
            }
            $scope.zNodeData = nodeData;
        }
        //保存表单
        this.save = function () {
            console.log($scope.currentTaskPlan)
        }
        this.addSave = function() {
            console.log($scope.addTaskPlan)
            alert("submit success");
        }
        this.getChooseNodeData = function(chooseData) {
            //获取到点击的tree节点数据
            console.log(chooseData)
        }
    }
   

}());