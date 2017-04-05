/******************************
 * modal弹窗组件 nbDialog
 * 使用方法：在需要点击生成弹窗的元素上添加 nb-dialog 属性
 * 你还需要添加属性: template-url="url"          这是弹窗内的模板路径
 *                locals="{someObj: obj}"     可以向dialog中传入数据，在模板中
 *                                            通过dialog.someObj取得
 ***********************
 * modal弹窗组件 nbConfirm 确认提示框
 * 使用方法：在需要点击生成弹窗的元素添加属性
 * 添加属性:
 *          nb-confirm="expression"           弹窗确认后的执行的表达式
 *            例如：nb-confirm="ctrl.callBack(isConfirm, arg1, arg2……)"
 *                 isConfirm参数的值为用户选择的确认和取消，分别对应true 和 false
 *
 *          nb-title="someString"             弹窗的标题
 *          nb-content="someString"           弹窗的内容
 * **************************************/


;(function(){
    angular.module('nb.directives')
    .directive('nbDialog', [
      '$mdDialog', function($mdDialog) {
        var postLink;
        postLink = function(scope, elem, attrs) {
          var falseValueRegExp, openDialog, options;
          if (!angular.isDefined(attrs.templateUrl)) {
            throw new Error('所有dialog都需要templateUrl');
          }
          options = {
            clickOutsideToClose: true
          };
          openDialog = function(evt) {
            var newScope, opts;
            newScope = scope.$new();
            opts = angular.extend({
              scope: newScope,
              targetEvent: evt
            }, options);
            opts = angular.extend(opts, {
              controller: function() {
                this.close = function(res) {
                  return $mdDialog.hide(res);
                };
                this.cancel = function(res) {
                  return $mdDialog.cancel(res);
                };
              },
              controllerAs: 'dialog',
              bindToController: true
            });
            angular.forEach(['locals', 'resolve'], function(key) {
              if (angular.isDefined(attrs[key])) {
                return opts[key] = scope.$eval(attrs[key]);
              }
            });
            return $mdDialog.show(opts);
          };
          angular.forEach(['templateUrl', 'template'], function(key) {
            if (angular.isDefined(attrs[key])) {
              return options[key] = attrs[key];
            }
          });
          falseValueRegExp = /^(false|0|)$/;
          angular.forEach(['clickOutsideToClose', 'focusOnOpen', 'bindToController'], function(key) {
            if (angular.isDefined(attrs[key])) {
              return options[key] = !falseValueRegExp.test(attrs[key]);
            }
          });
          elem.on('click', openDialog);
          return scope.$on('$destroy', function() {
            return elem.off('click', openDialog);
          });
        };
        return {
          restrict: 'A',
          link: postLink
        };
      }
    ])
    .directive('nbConfirm', [
      '$mdDialog', function($mdDialog) {
        var postLink;
        postLink = function(scope, elem, attrs) {
          var callback, performConfirm;
          attrs.$observe('nbTitle', function(newValue) {
            return scope.title = newValue || '提示';
          });
          attrs.$observe('nbContent', function(newValue) {
            return scope.content = newValue || '缺少内容';
          });
          performConfirm = function(evt) {
            var confirm;
            return confirm = $mdDialog.confirm().title(scope.title).content(scope.content).ok(attrs['okText'] || '确定').cancel(attrs['cancleText'] || '取消').targetEvent(evt);
          };
          callback = function(isConfirm) {
            return function() {
              return scope.onComplete({
                isConfirm: isConfirm
              });
            };
          };
          elem.on('click', function(evt) {
            var confirm, promise;
            confirm = performConfirm(evt);
            promise = $mdDialog.show(confirm);
            if (angular.isDefined(scope.onComplete)) {
              return promise.then(callback(true), callback(false));
            }
          });
          return scope.$on('destroy', function() {
            return elem.off('click');
          });
        };
        return {
          link: postLink,
          scope: {
            'onComplete': '&nbConfirm'
          }
        };
      }
    ]);


}());



