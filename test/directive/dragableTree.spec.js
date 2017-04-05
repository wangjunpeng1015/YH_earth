describe('测试D3树指令', function () {
    var $compile, scope;

    beforeEach(module('nb.directives'));
    beforeEach(inject(function (_$compile_, _$rootScope_) {
        $compile = _$compile_;
        scope = _$rootScope_.$new();
    }));

    it('成功生成svg元素', function () {
        scope.treeData = {
            "name": "数据0",
            "children": [{
                "name": "目标",
                "children": [{
                    "name": "任务",
                    "size": 8833
                }, {
                    "name": "目标目标",
                    "size": 1732
                }, {
                    "name": "任务任务",
                    "size": 3623
                }]
            }, {
                "name": "第三集团",
                "children": [{
                    "name": "侦察任务",
                    "size": 4116
                }]
            }, {
                "name": "侦察任务",
                "children": [{
                    "name": "目标1",
                    "size": 1082
                }, {
                    "name": "目标2",
                    "size": 1336
                }]
            }, {
                "name": "第一中队",
                "children": [{
                    "name": "平台5",
                    "size": 843
                }, {
                    "name": "平台6",
                    "children": [{
                        "name": "平台20",
                        "size": 354
                    }, {
                        "name": "平台8",
                        "size": 264
                    }]
                }]
            }]
        };
        var element = $compile('<dragable-tree class="dragable-tree" flex tree-data="treeData" class-name-of-new="plan1"></dragable-tree>')(scope);


        scope.$digest();
        expect(element.find('svg').length).toBeGreaterThan(0);
    })
})