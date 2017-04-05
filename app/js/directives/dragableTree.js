;(function() {
    angular.module('nb.directives')
        .config(function ($compileProvider) {
            // 解决日期选择器的日历不能正常渲染出日期的问题
            $compileProvider.preAssignBindingsEnabled(true);
        })
        .directive('dragableTree', ['$timeout', function($timeout) {
            var postLink = function(scope, elem, attrs) {
                var classNameOfNew = {
                    "trunk": attrs.trunk,
                    "leaf": attrs.leaf
                };
                // 用parentNode的宽高来设置svg的宽高，elem的宽高发生了不可预知的塌陷
                var parentNode = elem.parent();

                drawTree(scope, scope.treeData, elem, classNameOfNew, parentNode);

                scope.$watch('treeData', function(newVal) {
                    destroyTree(elem);

                    $timeout(function() {
                        drawTree(scope, newVal, elem, classNameOfNew, parentNode);
                    },100);
                });

                scope.$on('$destroy', function() {
                    destroyTree(elem);
                });
            }

            return {
                scope: {
                    treeData: '='
                },
                template: '<button style="display: none;" ng-click="ctrl.show($event)"></button>',
                controller: 'EditorCtrl',
                controllerAs: 'ctrl',
                link: postLink
            }
        }])
        .controller('EditorCtrl', EditorCtrl)
        .controller('PanelCtrl', PanelCtrl);

    function EditorCtrl($mdPanel, $scope) {
        this._mdPanel = $mdPanel;
    }

    EditorCtrl.prototype.show = function(ev) {
        var position = this._mdPanel.newPanelPosition()
            .relativeTo(this.d3Event.target)
            .addPanelPosition(this._mdPanel.xPosition.ALIGN_START, this._mdPanel.yPosition.BELOW);

        var animation = this._mdPanel.newPanelAnimation()
            .withAnimation(this._mdPanel.animation.FADE);

        // 从点击的节点的数据中获取值
        switch (this.data.dataType) {
            case 'string': this.value = this.data.name; break;
            case 'date': this.value = moment(this.data.name).toDate(); break;
            default: this.value = this.data.name;
        }

        var config = {
            attachTo: angular.element(document.body),
            controller: PanelCtrl,
            controllerAs: 'ctrl',
            template:
                '<div>' +
                '  <md-input-container md-no-float>' +
                '    ' + getDataPicker.call(this, this.data.dataType) +
                '  </md-input-container>' +
                '  <md-button class="md-raised md-primary" ng-click="ctrl.save()">保存</md-button>' +
                '  <md-button ng-click="ctrl.close()">取消</md-button>' +
                '</div>',
            panelClass: 'edit-popup',
            position: position,
            animation: animation,
            locals: {
                'data': this.data,
                'value': this.value,
                'updateNode': this.updateNode
            },
            openFrom: ev,
            clickOutsideToClose: true,
            escapeToClose: true,
            focusOnOpen: false,
            zIndex: 2
        };

        this._mdPanel.open(config);
    };

    // 判断当前节点的编辑种类
    // 以后要添加种类就在这个函数里面进行操作
    function getDataPicker(dataType) {
        switch (dataType) {
            case 'date': return '<md-datepicker ng-model="value" md-placeholder="请选择日期"></md-datepicker>'; break;
            case 'string':
            default: return '<input ng-model="value" placeholder="输入节点名称">';
        }
    }

    function PanelCtrl(mdPanelRef, $scope) {
        this._mdPanelRef = mdPanelRef;

        // 实现弹出层内部的双向绑定
        $scope.value = this.value;
    }

    PanelCtrl.prototype.close = function() {
        var panelRef = this._mdPanelRef;

        panelRef && panelRef.close().then(function() {
            panelRef.destroy();
        });
    };

    PanelCtrl.prototype.save = function() {
        this._mdPanelRef && this._mdPanelRef.close();
        // 把编辑后的节点数据更新到svg树上去
        switch (this.data.dataType) {
            case 'date': this.data.name = moment(this.$scope.value).format('YYYY-MM-DD'); break;
            case 'string':
            default: this.data.name = this.$scope.value;
        }
        this.updateNode(this.data);
    };


    function destroyTree(container) {
        d3.select(container[0]).select('svg').remove();
    }

    /***
    ** params: treeData(基础数据)
    *          container(指令根元素)
    *          classNameOfNew(需要拖拽生成新节点的元素class名)
    ******/

    function drawTree(scope, treeData, container, classNameOfNew, parentNode) {
        if(!angular.isDefined(treeData) || treeData === null) {
            console.warn("指令treeData属性未定义或为null, 初始化失败!");
            return
        }

        if(!angular.isDefined(parentNode) || parentNode === null) {
            console.warn("拖拽树必须有一个根元素包裹它，它才能获得宽高!");
            return
        }

        if(!angular.isDefined(classNameOfNew['trunk']) || !angular.isDefined(classNameOfNew['leaf'])) {
            console.warn("可拖拽元素的class没有被传入，无法初始化拖拽树");
            return
        }

        // Calculate total nodes, max label length
        var totalNodes = 0;
        var maxLabelLength = 0;
        // variables for drag/drop
        var selectedNode = null;
        var draggingNode = null;
        // panning variables
        var panSpeed = 200;
        var panBoundary = 20; // Within 20px from edges will pan when dragging.
        // Misc. variables
        var i = 0;
        var duration = 750;
        var root;

        // size of the diagram
        var viewerWidth = parentNode.width();
        var viewerHeight = parentNode.height();

        var tree = d3.layout.tree()
            .size([viewerHeight, viewerWidth]);

        // define a d3 diagonal projection for use by the node paths later on.
        var diagonal = d3.svg.diagonal()
            .projection(function(d) {
                return [d.y, d.x];
            });

        // A recursive helper function for performing some setup by walking through all nodes

        function visit(parent, visitFn, childrenFn) {
            if (!parent) return;

            visitFn(parent);

            var children = childrenFn(parent);
            if (children) {
                var count = children.length;
                for (var i = 0; i < count; i++) {
                    visit(children[i], visitFn, childrenFn);
                }
            }
        }

        // Call visit function to establish maxLabelLength
        visit(treeData, function(d) {
            totalNodes++;
            maxLabelLength = Math.max(d.name.length, maxLabelLength);

        }, function(d) {
            return d.children && d.children.length > 0 ? d.children : null;
        });
        // sort the tree according to the node names

        function sortTree() {
            tree.sort(function(a, b) {
                return b.name.toLowerCase() < a.name.toLowerCase() ? 1 : -1;
            });
        }
        // Sort the tree initially incase the JSON isn't in a sorted order.
        // sortTree();

        // TODO: Pan function, can be better implemented.

        function pan(domNode, direction) {
            // 暂时不用
            return;
            var speed = panSpeed;
            if (panTimer) {
                clearTimeout(panTimer);
                translateCoords = d3.transform(svgGroup.attr("transform"));
                if (direction == 'left' || direction == 'right') {
                    translateX = direction == 'left' ? translateCoords.translate[0] + speed : translateCoords.translate[0] - speed;
                    translateY = translateCoords.translate[1];
                } else if (direction == 'up' || direction == 'down') {
                    translateX = translateCoords.translate[0];
                    translateY = direction == 'up' ? translateCoords.translate[1] + speed : translateCoords.translate[1] - speed;
                }
                scaleX = translateCoords.scale[0];
                scaleY = translateCoords.scale[1];
                scale = zoomListener.scale();
                svgGroup.transition().attr("transform", "translate(" + translateX + "," + translateY + ")scale(" + scale + ")");
                d3.select(domNode).select('g.node').attr("transform", "translate(" + translateX + "," + translateY + ")");
                zoomListener.scale(zoomListener.scale());
                zoomListener.translate([translateX, translateY]);
                panTimer = setTimeout(function() {
                    pan(domNode, speed, direction);
                }, 50);
            }
        }

        // Define the zoom function for the zoomable tree

        function zoom() {
            svgGroup.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
        }


        // define the zoomListener which calls the zoom function on the "zoom" event constrained within the scaleExtents
        var zoomListener = d3.behavior.zoom().scaleExtent([0.1, 3]).on("zoom", zoom);

        function initiateDrag(d, domNode) {
            draggingNode = d;
            d3.select(domNode).select('.ghostCircle').attr('pointer-events', 'none');
            d3.selectAll('.ghostCircle').attr('class', 'ghostCircle show');
            d3.select(domNode).attr('class', 'node activeDrag');

            svgGroup.selectAll("g.node").sort(function(a, b) { // select the parent and sort the path's
                if (a.id != draggingNode.id) return 1; // a is not the hovered element, send "a" to the back
                else return -1; // a is the hovered element, bring "a" to the front
            });
            // if nodes has children, remove the links and nodes
            if (nodes.length > 1) {
                // remove link paths
                links = tree.links(nodes);
                nodePaths = svgGroup.selectAll("path.link")
                    .data(links, function(d) {
                        return d.target.id;
                    }).remove();
                // remove child nodes
                nodesExit = svgGroup.selectAll("g.node")
                    .data(nodes, function(d) {
                        return d.id;
                    }).filter(function(d, i) {
                        if (d.id == draggingNode.id) {
                            return false;
                        }
                        return true;
                    }).remove();
            }

            // remove parent link
            parentLink = tree.links(tree.nodes(draggingNode.parent));
            svgGroup.selectAll('path.link').filter(function(d, i) {
                if (d.target.id == draggingNode.id) {
                    return true;
                }
                return false;
            }).remove();

            dragStarted = null;
        }

        // define the baseSvg, attaching a class for styling and the zoomListener
        var baseSvg = d3.select(container[0]).append("svg")
            .attr("width", viewerWidth)
            .attr("height", viewerHeight)
            .attr("class", "overlay")
            .call(zoomListener);


        // Define the drag listeners for drag/drop behaviour of nodes.
        var dragListener = d3.behavior.drag()
            .on("dragstart", function(d) {
                if (d == root) {
                    return;
                }
                dragStarted = true;
                nodes = tree.nodes(d);
                d3.event.sourceEvent.stopPropagation();
                // it's important that we suppress the mouseover event on the node being dragged. Otherwise it will absorb the mouseover event and the underlying node will not detect it d3.select(this).attr('pointer-events', 'none');
            })
            .on("drag", function(d) {
                if (d == root) {
                    return;
                }
                if (dragStarted) {
                    domNode = this;
                    initiateDrag(d, domNode);
                }

                // get coords of mouseEvent relative to svg container to allow for panning
                relCoords = d3.mouse($('svg').get(0));
                if (relCoords[0] < panBoundary) {
                    panTimer = true;
                    pan(this, 'left');
                } else if (relCoords[0] > ($('svg').width() - panBoundary)) {

                    panTimer = true;
                    pan(this, 'right');
                } else if (relCoords[1] < panBoundary) {
                    panTimer = true;
                    pan(this, 'up');
                } else if (relCoords[1] > ($('svg').height() - panBoundary)) {
                    panTimer = true;
                    pan(this, 'down');
                } else {
                    try {
                        clearTimeout(panTimer);
                    } catch (e) {

                    }
                }

                d.x0 += d3.event.dy;
                d.y0 += d3.event.dx;
                var node = d3.select(this);
                node.attr("transform", "translate(" + d.y0 + "," + d.x0 + ")");
                updateTempConnector();
            }).on("dragend", function(d) {
                if (d == root) {
                    return;
                }
                domNode = this;
                if (selectedNode) {
                    // now remove the element from the parent, and insert it into the new elements children
                    var index = draggingNode.parent.children.indexOf(draggingNode);
                    if (index > -1) {
                        draggingNode.parent.children.splice(index, 1);
                    }
                    if (typeof selectedNode.children !== 'undefined' || typeof selectedNode._children !== 'undefined') {
                        if (typeof selectedNode.children !== 'undefined') {
                            selectedNode.children.push(draggingNode);
                        } else {
                            selectedNode._children.push(draggingNode);
                        }
                    } else {
                        selectedNode.children = [];
                        selectedNode.children.push(draggingNode);
                    }
                    // Make sure that the node being added to is expanded so user can see added node is correctly moved
                    expand(selectedNode);
                    // sortTree();
                    endDrag();
                } else {
                    endDrag();
                }
            });

        function endDrag() {
            selectedNode = null;
            d3.selectAll('.ghostCircle').attr('class', 'ghostCircle');
            d3.select(domNode).attr('class', 'node');
            // now restore the mouseover event or we won't be able to drag a 2nd time
            d3.select(domNode).select('.ghostCircle').attr('pointer-events', '');
            updateTempConnector();
            if (draggingNode !== null) {
                update(root);
                // centerNode(draggingNode);
                draggingNode = null;
            }

            // $apply通知angular执行$digest循环
            scope.$apply(function() {
                scope.treeData = root;
            });
        }

        // Helper functions for collapsing and expanding nodes.

        function collapse(d) {
            if (d.children) {
                d._children = d.children;
                d._children.forEach(collapse);
                d.children = null;
            }
        }

        function expand(d) {
            if (d._children) {
                d.children = d._children;
                d.children.forEach(expand);
                d._children = null;
            }
        }

        var overCircle = function(d) {
            selectedNode = d;
            updateTempConnector();
        };
        var outCircle = function(d) {
            selectedNode = null;
            updateTempConnector();
        };

        // Function to update the temporary connector indicating dragging affiliation
        var updateTempConnector = function(absolute) {
            var svgGroupOffset = {
                'x': parseInt(svgGroup.attr('transform').split('(')[1].split(')')[0].split(',')[0], 10),
                'y': parseInt(svgGroup.attr('transform').split('(')[1].split(')')[0].split(',')[1], 10),
                'scale': zoomListener.scale()
            }

            var data = [];
            var translateCoords = d3.transform(svgGroup.attr("transform"));
            if (draggingNode !== null && selectedNode !== null) {
                // have to flip the source coordinates since we did this for the existing connectors on the original tree
                data = [{
                    source: {
                        x: selectedNode.y0,
                        y: selectedNode.x0
                    },
                    target: {
                        x: absolute ? (draggingNode.x0 - translateCoords.translate[0])/svgGroupOffset.scale : draggingNode.y0,
                        y: absolute ? (draggingNode.y0 - translateCoords.translate[1])/svgGroupOffset.scale : draggingNode.x0
                    }
                }];
            }
            var link = svgGroup.selectAll(".templink").data(data);

            link.enter().append("path")
                .attr("class", "templink")
                .attr("d", d3.svg.diagonal())
                .attr('pointer-events', 'none');

            link.attr("d", d3.svg.diagonal());

            link.exit().remove();
        };

        // Function to center node when clicked/dropped so node doesn't get lost when collapsing/moving with large amount of children.

        function centerNode(source) {
            scale = zoomListener.scale();
            x = -source.y0;
            y = -source.x0;
            x = x * scale + viewerWidth / 2;
            y = y * scale + viewerHeight / 2;
            d3.select('g').transition()
                .duration(duration)
                .attr("transform", "translate(" + x + "," + y + ")scale(" + scale + ")");
            zoomListener.scale(scale);
            zoomListener.translate([x, y]);
        }

        // Toggle children function

        function toggleChildren(d) {
            if (d.children) {
                d._children = d.children;
                d.children = null;
            } else if (d._children) {
                d.children = d._children;
                d._children = null;
            }
            return d;
        }


        // 将update提供给angular的controller使用
        scope.ctrl.updateNode = function (node) {
            update(node);
        }
        // tree节点的click处理函数
        function click(d) {
            if (d3.event.defaultPrevented) return; // click suppressed
            scope.$apply(function () {
                scope.ctrl.d3Event = d3.event;
                scope.ctrl.data = d;
            });
            container.find('button').trigger('click');
            // centerNode(d);
        }

        function update(source) {
            // Compute the new height, function counts total children of root node and sets tree height accordingly.
            // This prevents the layout looking squashed when new nodes are made visible or looking sparse when nodes are removed
            // This makes the layout more consistent.
            var levelWidth = [1];
            var childCount = function(level, n) {

                if (n.children && n.children.length > 0) {
                    if (levelWidth.length <= level + 1) levelWidth.push(0);

                    levelWidth[level + 1] += n.children.length;
                    n.children.forEach(function(d) {
                        childCount(level + 1, d);
                    });
                }
            };
            childCount(0, root);
            var newHeight = d3.max(levelWidth) * 25; // 25 pixels per line
            tree = tree.size([newHeight, viewerWidth]);

            // Compute the new tree layout.
            var nodes = tree.nodes(root).reverse(),
                links = tree.links(nodes);

            // Set widths between levels based on maxLabelLength.
            nodes.forEach(function(d) {
                d.y = (d.depth * 200 + (maxLabelLength * 10 + 20)); //maxLabelLength * 10px
                // alternatively to keep a fixed scale one can set a fixed depth per level
                // Normalize for fixed-depth by commenting out below line
                // d.y = (d.depth * 500); //500px per level.
                d.x = (d.x * 3);
            });

            // Update the nodes…
            node = svgGroup.selectAll("g.node")
                .data(nodes, function(d) {
                    return d.id || (d.id = ++i);
                });

            // Enter any new nodes at the parent's previous position.
            var nodeEnter = node.enter().append("g")
                .call(dragListener)
                .attr("class", "node")
                .attr("transform", function(d) {
                    return "translate(" + source.y0 + "," + source.x0 + ")";
                })
                .on('click', click);

            nodeEnter.append("rect")
                .attr('class', 'nodeRect')
                .attr('stroke', function(d) {
                    if(d.type === 'root') {
                        return 'blue';
                    }
                    else if(d.type === 'trunk') {
                        return 'green';
                    }
                    else if(d.type === 'leaf') {
                        return 'red';
                    }
                })
                .attr('width', 0)
                .attr('height', 0)
                .attr('transform', function(d) {
                    var width = d.name.replace(/[^\x00-\xff]/g, 'aa').length*5 + 20,
                        height = 30;

                    return ('translate('+ (0 - width/2) + ',' + (0 - height/2) + ')');

                })
                .style("fill", function(d) {
                    return d._children ? "lightsteelblue" : "#fff";
                });

            nodeEnter.append("text")
                .attr("x", 0)
                .attr("dy", ".35em")
                .attr('class', 'nodeText')
                .attr("text-anchor", "middle")
                .text(function(d) {
                    return d.name;
                })
                .style("fill-opacity", 0);

            // phantom node to give us mouseover in a radius around it
            nodeEnter.append("circle")
                .attr('class', 'ghostCircle')
                .attr("r", 60)
                .attr("opacity", 0.2) // change this to zero to hide the target area
            .style("fill", "red")
                .attr('pointer-events', 'mouseover')
                .on("mouseover", function(node) {
                    overCircle(node);
                })
                .on("mouseout", function(node) {
                    outCircle(node);
                });

            // Update the text to reflect whether node has children or not.
            node.select('text')
                .attr("text-anchor", "middle")
                .text(function(d) {
                    return d.name;
                });

            // Change the circle fill depending on whether it has children and is collapsed
            node.select("rect.nodeRect")
                .attr("width", function(d) {
                    var chars = d.name.replace(/[^\x00-\xff]/g, 'aa').length;
                    return (chars*5 + 20);
                })
                .attr("height", 30)
                .attr('transform', function(d) {
                    var width = d.name.replace(/[^\x00-\xff]/g, 'aa').length*5 + 20,
                        height = 30;

                    return ('translate('+ (0 - width/2) + ',' + (0 - height/2) + ')');

                })
                .style("fill", function(d) {
                    return d._children ? "lightsteelblue" : "#fff";
                });

            // Transition nodes to their new position.
            var nodeUpdate = node.transition()
                .duration(duration)
                .attr("transform", function(d) {
                    return "translate(" + d.y + "," + d.x + ")";
                });

            // Fade the text in
            nodeUpdate.select("text")
                .style("fill-opacity", 1);

            // Transition exiting nodes to the parent's new position.
            var nodeExit = node.exit().transition()
                .duration(duration)
                .attr("transform", function(d) {
                    return "translate(" + source.y + "," + source.x + ")";
                })
                .remove();

            nodeExit.select("rect")
                .attr("r", 0);

            nodeExit.select("text")
                .style("fill-opacity", 0);

            // Update the links…
            var link = svgGroup.selectAll("path.link")
                .data(links, function(d) {
                    return d.target.id;
                });

            // Enter any new links at the parent's previous position.
            link.enter().insert("path", "g")
                .attr("class", "link")
                .attr("d", function(d) {
                    var o = {
                        x: source.x0,
                        y: source.y0
                    };
                    return diagonal({
                        source: o,
                        target: o
                    });
                });

            // Transition links to their new position.
            link.transition()
                .duration(duration)
                .attr("d", diagonal);

            // Transition exiting nodes to the parent's new position.
            link.exit().transition()
                .duration(duration)
                .attr("d", function(d) {
                    var o = {
                        x: source.x,
                        y: source.y
                    };
                    return diagonal({
                        source: o,
                        target: o
                    });
                })
                .remove();

            // Stash the old positions for transition.
            nodes.forEach(function(d) {
                d.x0 = d.x;
                d.y0 = d.y;
            });
        }

        // Append a group which holds all nodes and which the zoom Listener can act upon.
        var svgGroup = baseSvg.append("g");

        // Define the root
        root = treeData;
        root.x0 = viewerHeight / 2;
        root.y0 = 0;

        // Layout the tree initially and center on the root node.
        update(root);
        centerNode(root);

        // 自定义: 拖拽指令外部的类，添加新的节点
        var tempNode, tempData;
        attachDragEvent(classNameOfNew.trunk, "trunk");
        attachDragEvent(classNameOfNew.leaf, "leaf");

        function getTempData(d) {
            return {
                "name": d.name,
                "type": d.type,
                "dataType": d.dataType,
                "x0": 0,
                "y0": 0,
                "depth": 0,
                "x": 0,
                "y": 0,
                "id": ++totalNodes,
                "parent": root
            }
        }
        function getTempNode(type) {
            var node = svgGroup
                .append('g')
                .data([tempData])
                .attr('class', 'node')
                .style('opacity', 0);

            node.append("rect")
                .attr('class', 'nodeRect')
                .attr("width", function(d) {
                    var chars = d.name.length;
                    return (chars*10 + 20);
                })
                .attr('stroke', function(d) {
                    if(type === 'root') {
                        return 'blue';
                    }
                    else if(type === 'trunk') {
                        return 'green';
                    }
                    else if(type === 'leaf') {
                        return 'red';
                    }
                })
                .attr("height", 30)
                .attr('transform', function(d) {
                    var width = d.name.length*10 + 20,
                        height = 30;

                    return ('translate('+ (0 - width/2) + ',' + (0 - height/2) + ')');

                })
                .style("fill", function(d) {
                    return d._children ? "lightsteelblue" : "#fff";
                });

            node.append("text")
                .attr("x", 0)
                .attr("dy", ".35em")
                .attr('class', 'nodeText')
                .attr("text-anchor", "middle")
                .text(function(d) {
                    return d.name;
                });
            return node;
        }

        function attachDragEvent(selector, type, dragEndFun) {
            d3.selectAll('.' + selector).call(d3.behavior.drag()
                .on("dragstart", function(d) {
                    var target = d3.event.sourceEvent.target;
                    if (target.getAttribute('target') == null) {
                        return false;
                    }
                    tempData = getTempData({ 
                        name: target.textContent, 
                        type: type, 
                        dataType: this.getAttribute('data-data-type')
                    });
                    tempNode = getTempNode(type);
                    d = tempData;
                    dragStarted = true;
                    tempNode.style('opacity', 100);
                    nodes = tree.nodes(d);
                    d3.event.sourceEvent.stopPropagation();
                })
                .on("drag", function(d) {
                    d = tempData;

                    var svgGroupOffset = {
                        'x': parseInt(svgGroup.attr('transform').split('(')[1].split(')')[0].split(',')[0], 10),
                        'y': parseInt(svgGroup.attr('transform').split('(')[1].split(')')[0].split(',')[1], 10),
                        'scale': zoomListener.scale()
                    }

                    var newNode = tempNode[0][0];

                    if (dragStarted) {
                        domNode = newNode;
                        initiateDrag(d, domNode);
                    }

                    // get coords of mouseEvent relative to svg container to allow for panning
                    relCoords = d3.mouse($('svg').get(0));
                    if (relCoords[0] < panBoundary) {
                        panTimer = true;
                        pan(newNode, 'left');
                    } else if (relCoords[0] > ($('svg').width() - panBoundary)) {

                        panTimer = true;
                        pan(newNode, 'right');
                    } else if (relCoords[1] < panBoundary) {
                        panTimer = true;
                        pan(newNode, 'up');
                    } else if (relCoords[1] > ($('svg').height() - panBoundary)) {
                        panTimer = true;
                        pan(newNode, 'down');
                    } else {
                        try {
                            clearTimeout(panTimer);
                        } catch (e) {

                        }
                    }

                    d.x0 = relCoords[0] + 10;
                    d.y0 = relCoords[1];
                    var node = d3.select(newNode);
                    node.attr("transform", "translate(" + (d.x0 - svgGroupOffset.x)/svgGroupOffset.scale + "," + (d.y0 - svgGroupOffset.y)/svgGroupOffset.scale + ")");
                    updateTempConnector(true);
                }).on("dragend", function(d) {
                    tempNode.style('opacity', 0);
                    tempNode.remove();

                    if (selectedNode && selectedNode.type != "leaf") {
                        // now remove the element from the parent, and insert it into the new elements children
                        var index = draggingNode.parent.children.indexOf(draggingNode);
                        if (index > -1) {
                            draggingNode.parent.children.splice(index, 1);
                        }
                        if (typeof selectedNode.children !== 'undefined' || typeof selectedNode._children !== 'undefined') {
                            if (typeof selectedNode.children !== 'undefined') {
                                selectedNode.children.push(draggingNode);
                            } else {
                                selectedNode._children.push(draggingNode);
                            }
                        } else {
                            selectedNode.children = [];
                            selectedNode.children.push(draggingNode);
                        }
                        // Make sure that the node being added to is expanded so user can see added node is correctly moved
                        expand(selectedNode);
                        // sortTree();
                        endDrag();
                    } else {
                        endDrag();
                    }
                }));
            }
        }
}());