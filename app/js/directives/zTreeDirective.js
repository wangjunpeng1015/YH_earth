;(function(){
	angular.module("nb.directives")
		.directive('ztree',['$http','$timeout',function($http,$timeout){
			var link;
			var id="";
			link=function(scope, element, attrs){
				var ulElement = element.find('ul');
				id=attrs.treeId;
				ulElement.attr("id",id);
				var treeInit = function(container, zTreedata){
					var zTreeObj;

					var setting = {
						treeId:"earthTree",
				    	check: {
							enable: true,
							chkStyle:"checkbox"
						},
						view: {
							showLine: false
						},
						simpleData: {
							enable: true
						},
						callback: {
							onClick: function(event, treeId, treeNode){

								scope.chooseNode=treeNode;
								if(attrs.clickFun){
									//调用传递过来的函数并传参，定义参数名，使用时参数名需保持一致，根据参数名获取对应参数
									//eg:click-fun="test(treeNode)"
									scope.clickFun({event:event,treeId:treeId,treeNode:treeNode});
								}
							},
							onCheck:function(event, treeId, treeNode){
								if(treeNode.checked){
									scope.checkNodes.push(treeNode);
								}else{
									var index=_.indexOf(scope.checkNodes,treeNode);
									scope.checkNodes.splice(index,1);
								}
								if(attrs.checkFun){
									scope.checkFun({event:event,treeId:treeId,treeNode:treeNode});
								}
							}
						}
					}

			    	if(attrs.chkstyle){
						setting.check.chkStyle=attrs.chkstyle;
					}else{
						setting.check.enable=false;
					}

					var zNodes = zTreedata;

					zTreeObj = $.fn.zTree.init(container, setting, zNodes);

			    };

				scope.$watch('data', function(newVal,oldVal) {
                    destroyTree(element);
                    $timeout(function() {
                        treeInit(ulElement, scope.data);
                    },100);
                });

                scope.$on('$destroy', function() {
                    destroyTree(element);
                });

				treeInit(ulElement, scope.data);
			}


			return {
				restrict: 'EA',
				scope:{
					data:"=nodes",//ztree数据
					chkstyle:"=chkstyle",//是否有checkbox
					checkFun:"&",//onCheck事件方法
					clickFun:"&",//onClick事件方法
					chooseNode:"=",//onclick时所选择的数据
					checkNodes:"=",//已勾选的数据
					treeId:"="
				},
				template: '<ul class="ztree"></ul>',
				link:link
			  };
		}])
		function destroyTree(elem){//销毁 id 为 "treeDemo" 的 zTree
			$.fn.zTree.destroy(elem);
		}
}());