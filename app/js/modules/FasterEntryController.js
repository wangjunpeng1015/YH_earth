;(function(){
    var nb = this.nb;
    var app = nb.app;

    var routeConfig = function($stateProvider) {
        $stateProvider
            .state({
                name: 'FasterEntry',
                url: '/FasterView/FasterEntry',
                templateUrl: '../partials/FasterView/FasterEntry.html',
            });
        }

    app.config(['$stateProvider', routeConfig]);

    var TaskViewController = function($scope, $rootScope, $q, $timeout, $http) {
        this.$inject = ['$scope', '$rootScope', '$q', '$timeout', '$http'];

        $scope.flag = true;
        $scope.treeData = null;
        $scope.tasksTreeData = null;

        getTasksTreeData();

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

        function getTasksTreeData() {
            $http.get('/api/task_break_down/plans').then(function(data) {
                $scope.allTask=data.data;
                $scope.tasksTreeData = data.data;
            });
        }

        //监听输入数据改变获取任务列表
        $scope.$watch('seachTasks', function(newVal,oldVal) {
            $timeout(function() {
                seachTask(newVal);
            },100);
        });

        var seachTask = function(val){
            var seachTaskTemp=[];
            if(val!=undefined){
               if(val!=""){
                 _.forEach($scope.allTask,function(sval){
                    if(sval["children"]){
                        _.forEach(sval["children"],function(ssval){
                            if(ssval["name"].indexOf(val)>=0){
                                seachTaskTemp.push(ssval)
                            }
                        })
                    }else if(sval["name"].indexOf(val)>=0){
                        seachTaskTemp.push(sval)
                    }
                })
                $scope.tasksTreeData = seachTaskTemp
               }else{
                $scope.tasksTreeData = $scope.allTask
               }
            }
        }
    }

    var CommandViewController = function($scope, $rootScope, $q, $timeout, $http) {
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

        function getTasksTreeData() {
            $http.get('/api/task_break_down/plans').then(function(data) {
                $scope.tasksTreeData = data.data;
            });
        }
    }


    app.controller('TaskViewCtrl', ['$scope', '$rootScope', '$q', '$timeout', '$http', TaskViewController]);
    app.controller('CommandViewCtrl', ['$scope', '$rootScope', '$q', '$timeout', '$http', CommandViewController]);

    // var FasterEntryController = function($scope, $http, $timeout, $rootScope, mockD3TreeData0, mockD3TreeData1) {
    //     this.$inject = ['$scope', '$http', '$timeout', '$rootScope', 'mockD3TreeData0', 'mockD3TreeData1'];
    //     $scope.treeData = mockD3TreeData0.treeData;
    //     this.clickHandler = function() {
    //         $scope.treeData = mockD3TreeData1.treeData;
    //     };
    //     //任务视图
    //     $http.get('/api/taskview/task/1').then(function(data){
    //         $scope.allTask=data.data;
    //         $scope.zTaskNodes=data.data;
    //     },function(err){
    //         console.log("请求错误")
    //     })

    //     //监听输入数据改变获取任务列表
    //     $scope.$watch('seachTasks', function(newVal,oldVal) {
    //         $timeout(function() {
    //             seachTask(newVal);
    //         },100);
    //     });
    //     var seachTask = function(val){
    //         var seachTaskTemp=[];
    //         if(val!=undefined){
    //            if(val!=""){
    //              _.forEach($scope.allTask,function(sval){
    //                 if(sval["name"].indexOf(val)>=0){
    //                      seachTaskTemp.push(sval)
    //                 }
    //             })
    //             $scope.zTaskNodes = seachTaskTemp
    //            }else{
    //             $scope.zTaskNodes = $scope.allTask
    //            }
    //         }
    //     }
    //     var digest=[
    //         {label:'制作单位:',describe:''},
    //         {label:'制作时间:',describe:''},
    //         {label:'制作人:',describe:''},
    //         {label:'密级:',describe:''},
    //         {label:'权限:',describe:''},
    //         {label:'开始时间:',describe:''},
    //         {label:'结束时间:',describe:''},
    //     ]
    //     //摘要初始化
    //     $scope.getData=digest
    //     this.digest=function(event,treeId,treeNode){
    //         console.log(treeNode.digest)
    //         if(treeNode.digest&&treeNode.digest.length!=0){
    //             $scope.$apply($scope.getData = treeNode.digest)
    //         }else{
    //              $scope.$apply($scope.getData=digest)
    //         }

    //     }
    //     //指挥视图
    //     var zComNodes = [
    //         {name:"空军一", open:true, children:[
    //             {name:"空军二"}, {name:"test1_2",children:[{name:"test1_2_3"}]}]},
    //         {name:"空军二", open:true, children:[
    //             {name:"test2_1"}, {name:"test2_2"}]}
    //      ];
    //     $scope.zComNodes=zComNodes
    //     this.loadPlans = function(){
    //         $scope.plans = zComNodes;
    //     };
    //     this.getPlan = function(){
    //         $scope.zComNodes=$scope.plan
    //     }
    // }
}());