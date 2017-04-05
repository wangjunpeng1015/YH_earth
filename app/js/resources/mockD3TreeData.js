// 数据相关的service用这种方式定义
;(function(){
    var resources = angular.module('nb.resources')

    mockD3TreeData0 = function() {

        treeData = {
            "name": "根节点",
            "type": "root",
            "children": [{
                "name": "枝干节点",
                "type": "trunk",
                "children": [{
                    "name": "叶子",
                    "type": "leaf"
                }]
            }, {
                "name": "枝干节点",
                "type": "trunk",
                "children": [{
                    "name": "叶子",
                    "type": "leaf"
                }]
            }, {
                "name": "枝干节点",
                "type": "trunk"
            }, {
                "name": "枝干节点",
                "type": "trunk"
            }]
        }

        return {
            treeData: treeData
        }
    }

    mockD3TreeData1 = function() {

        treeData = {
            "name": "数据1",
            "children": [{
                "name": "display",
                "children": [{
                    "name": "DirtySprite",
                    "size": 8833
                }, {
                    "name": "LineSprite",
                    "size": 1732
                }, {
                    "name": "RectSprite",
                    "size": 3623
                }]
            }, {
                "name": "flex",
                "children": [{
                    "name": "FlareVis",
                    "size": 4116
                }]
            }, {
                "name": "physics",
                "children": [{
                    "name": "DragForce",
                    "size": 1082
                }, {
                    "name": "GravityForce",
                    "size": 1336
                }]
            }, {
                "name": "query",
                "children": [{
                    "name": "Maximum",
                    "size": 843
                }, {
                    "name": "methods",
                    "children": [{
                        "name": "xor",
                        "size": 354
                    }, {
                        "name": "_",
                        "size": 264
                    }]
                }]
            }]
        }

        return {
            treeData: treeData
        }
    }

    resources.factory('mockD3TreeData0', [mockD3TreeData0])
    resources.factory('mockD3TreeData1', [mockD3TreeData1])

}());