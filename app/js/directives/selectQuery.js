;(function(){
	 var searchController=function ($scope, $q, $timeout, $http,$attrs){
			 	this.$inject = ['$scope', '$q', '$timeout','$attrs'];
			 	var searhText=null;
			 	var selectedItem=null;
			 	console.log($attrs);
			 	var array;
			 	$scope.$watch('queryData', function(newVal,oldVal) {
                   	array=$scope.queryData;
                });
			 	this.querySearch = function(query) {
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
	        	

			 }
	angular.module("nb.directives")
		.directive('selectQuery',['$http','$timeout',function($http,$timeout){
			var link;
			link=function(scope, element, attrs,ctrl){
				var ngModelCtrl;
				if(ctrl){
					ngModelCtrl=ctrl;
				}

				scope.onSearchTextChange =function(text){
					scope.searchTextChange()
				}
				
				scope.onSelectedItemChange =function(item){
					scope.selectedItemChange()
					if(ngModelCtrl){
						ngModelCtrl.$setViewValue(item) 
					}
				}

				scope.$watch('bindModel',function(newVal,oldVal){
					if(newVal == null){
						scope.ctrl.searchText = newVal
						scope.ctrl.selectedItem = newVal
					}
					
				});

				if(ngModelCtrl){
					ngModelCtrl.$render=function(){
						if(ngModelCtrl.$viewValue){
							scope.ctrl.selectedItem = ngModelCtrl.$viewValue
						}
					}
				}

			}		
			return{
				require:"?ngModel",
				restrict: 'EA',
				scope:{
					bindModel:"=ngModel",
					labelName:"@",
					queryData:"=",
					searchTextChange:"&",
					selectedItemChange:"&",
					editStatus: '=editable'
				},
				templateUrl: '/partials/share/selectQuery.html',
				link:link,
				controller:searchController,
				controllerAs: 'ctrl'
			 };
		}])

}());