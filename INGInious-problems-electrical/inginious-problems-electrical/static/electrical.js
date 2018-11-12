function load_input_electrical(submissionid, key, input) { 
    if(key in input) {
        document.getElementById('graphContainer').innerHTML = "";  // clean the older graph
        old_submission(document.getElementById('graphContainer'), input[key]);
    }
    else
        console.log("pas de xml");
}

function studio_init_template_electrical(well, pid, problem)
{   
    if("default" in problem)
        $('#default-' + pid, well).val(problem["default"]);
}

function old_submission(container, xmlText)
		{
			// Checks if the browser is supported
			if (!mxClient.isBrowserSupported())
			{
				// Displays an error message if the browser is not supported.
				mxUtils.error('Browser is not supported!', 200, false);
			}
			else
			{
				// Disables the built-in context menu
				mxEvent.disableContextMenu(container);
				
				var doc = mxUtils.createXmlDocument();

				//The list of xml files
				var stencilsFile = new Array("resistors.xml","signal_sources.xml") 
				
				// Creates the graph inside the given container
				var graph = new mxGraph(container);
                graph.setConnectable(true);
                new mxKeyHandler(graph);
				// send xml of 2 graph in 2 input when submit
				jQuery(document).ready(function(){
					jQuery("#task-submit").click(function(){
						var encoder = new mxCodec();
						var node = encoder.encode(graph.getModel());
						jQuery("#value-submit").val(mxUtils.getPrettyXml(node));
					});
				});
                
                // Overrides method to disallow edge label editing
				graph.isCellEditable = function(cell)
				{
					return !this.getModel().isEdge(cell);
				};
				
				// Overrides method to provide a cell label in the display
				graph.convertValueToString = function(cell)
				{
					if (mxUtils.isNode(cell.value))
					{
						if (cell.value.nodeName.toLowerCase() == 'component')
						{
							var name = cell.getAttribute('name', '');
							var value = cell.getAttribute('value', '');
							return name + ' ' + value;
						}
					}
					return '';
				};
				// Overrides method to store a cell label in the model
				var cellLabelChanged = graph.cellLabelChanged;
				graph.cellLabelChanged = function(cell, newValue, autoSize)
				{
					if (mxUtils.isNode(cell.value) &&
						cell.value.nodeName.toLowerCase() == 'component')
					{
						var pos = newValue.indexOf(' ');
						var name = (pos > 0) ? newValue.substring(0,
								pos) : newValue;
						var value = (pos > 0) ? newValue.substring(
								pos + 1, newValue.length) : '';
						// Clones the value for correct undo/redo
						var elt = cell.value.cloneNode(true);
						elt.setAttribute('name', name);
						elt.setAttribute('value', value);
						newValue = elt;
						autoSize = false;
					}
					
					cellLabelChanged.apply(this, arguments);
				};
				
				// Overrides method to create the editing value
				var getEditingValue = graph.getEditingValue;
				graph.getEditingValue = function(cell)
				{
					if (mxUtils.isNode(cell.value) &&
						cell.value.nodeName.toLowerCase() == 'component')
					{
						var name = cell.getAttribute('name', '');
						var value = cell.getAttribute('value', '');
						return name + ' ' + value;
					}
				};
			
			    // Disables automatic handling of ports. This disables the reset of the
			    // respective style in mxGraph.cellConnected. Note that this feature may
			    // be useful if floating and fixed connections are combined.
			    graph.setPortsEnabled(false);
				
                //Maximum size
			    graph.maximumGraphBounds = new mxRectangle(0, 0, 1800, 1600)
			    graph.border = 50;
				var styleV = graph.getStylesheet().getDefaultVertexStyle();
				styleV['movable'] = '1';
				styleV['resizable'] = '1';
				styleV[mxConstants.STYLE_STROKECOLOR] = '#000000';
				styleV[mxConstants.STYLE_FILLCOLOR] = '#FFFFFF';
				var styleE = graph.getStylesheet().getDefaultEdgeStyle();
				delete styleE['endArrow'];
				styleE['movable'] = '1';
				styleE['resizable'] = '0';
				styleE['edgeStyle'] = 'wireEdgeStyle';
				styleE['fontSize'] = '9';
				styleE['movable'] = '0';
				// Enables rubberband selection
				new mxRubberband(graph);
				       
				
                // Disables floating connections (only connections via ports allowed)
			    graph.connectionHandler.isConnectableCell = function(cell)
			    {
			        return false;
			    };
			    mxEdgeHandler.prototype.isConnectableCell = function(cell)
			    {
				    return graph.connectionHandler.isConnectableCell(cell);
			    };
				
			    // Disables existing port functionality
			    graph.view.getTerminalPort = function(state, terminal, source)
			    {
				    return terminal;
			    };
                // Returns all possible ports for a given terminal
			    graph.getAllConnectionConstraints = function(terminal, source)
			    {
				    if (terminal != null && terminal.shape != null &&
					    terminal.shape.stencil != null)
				    {
					    // for stencils with existing constraints...
					    if (terminal.shape.stencil != null)
					    {
						    return terminal.shape.stencil.constraints;
					    }
				    }
				    else if (terminal != null && this.model.isVertex(terminal.cell))
				    {
					    if (terminal.shape != null)
					    {
						    var ports = terminal.shape.getPorts();
						    var cstrs = new Array();
						
						    for (var id in ports)
						    {
							    var port = ports[id];
							
							    var cstr = new mxConnectionConstraint(new mxPoint(port.x, port.y), port.perimeter);
							    cstr.id = id;
							    cstrs.push(cstr);
						    }
						
						    return cstrs;
					    }
				    }
				
				    return null;
			    };
			
			    // Sets the port for the given connection
			    graph.setConnectionConstraint = function(edge, terminal, source, constraint)
			    {
				    if (constraint != null)
				    {
					    var key = (source) ? mxConstants.STYLE_SOURCE_PORT : mxConstants.STYLE_TARGET_PORT;
					
					    if (constraint == null || constraint.id == null)
					    {
						    this.setCellStyles(key, null, [edge]);
					    }
					    else if (constraint.id != null)
					    {
						    this.setCellStyles(key, constraint.id, [edge]);
					    }
				    }
			    };
			
			    // Returns the port for the given connection
			    graph.getConnectionConstraint = function(edge, terminal, source)
			    {
				    var key = (source) ? mxConstants.STYLE_SOURCE_PORT : mxConstants.STYLE_TARGET_PORT;
				    var id = edge.style[key];
				
				    if (id != null)
				    {
					    var c =  new mxConnectionConstraint(null, null);
					    c.id = id;
					
					    return c;
				    }
				
				    return null;
			    };
			    // Returns the actual point for a port by redirecting the constraint to the port
			    graphGetConnectionPoint = graph.getConnectionPoint;
			    graph.getConnectionPoint = function(vertex, constraint)
			    {
				    if (constraint.id != null && vertex != null && vertex.shape != null)
				    {
				    	
				    	var port;
					    var ports = vertex.shape['stencil'].constraints;
					    if(ports[0].name == constraint.id)
					    {
					    	port = ports[0];

					    }
					    else
					    {
					    	port = ports[1];
					    }
						
					    if (port != null)	
					    {
						    constraint = new mxConnectionConstraint(new mxPoint(port.point.x, port.point.y), port.perimeter);
					    }
				    }
				
				    return graphGetConnectionPoint.apply(this, arguments);
			    };				
				   
                //The list of xml files	                  
				stencilsFile.forEach(function(element){
					var req = mxUtils.load('/plugins/electrical/static/stencils/' + element);
					var root = req.getDocumentElement();
					var shape = root.firstChild;
				
					while (shape != null)
					{
						if (shape.nodeType == mxConstants.NODETYPE_ELEMENT)
						{
							mxStencilRegistry.addStencil(shape.getAttribute('name'), new mxStencil(shape));
						}
				
						shape = shape.nextSibling;
					}
				});

                // create graph from the default xml
                var parser = new DOMParser();
                xml = parser.parseFromString(xmlText, "text/xml");
                var root = xml.documentElement;
	            var dec = new mxCodec(root.ownerDocument);
                dec.decode(root, graph.getModel());
					
			    // Implements a properties panel that uses
				// mxCellAttributeChange to change properties
				graph.getSelectionModel().addListener(mxEvent.CHANGE, function(sender, evt)
				{
					selectionChanged(graph);
				});
				selectionChanged(graph);
			}
			/**
			 * Updates the properties panel
			 */
			function selectionChanged(graph)
			{
				var div = document.getElementById('properties');
				// Forces focusout in IE
				graph.container.focus();
				// Clears the DIV the non-DOM way
				div.innerHTML = '';
				// Gets the selection cell
				var cell = graph.getSelectionCell();
				if (cell != null && cell.value.nodeName.toLowerCase() == 'component')
				{
					// Writes the title
					var center = document.createElement('center');
					mxUtils.writeln(center, 'Editing ' + cell.getAttribute('name'));
					div.appendChild(center);
					mxUtils.br(div);
					// Creates the form from the attributes of the user object
					var form = new mxForm();
	
					var attrs = cell.value.attributes;
					
					for (var i = 0; i < attrs.length; i++)
					{	
						if(attrs[i].nodeName != 'type') {
							createTextField(graph, form, cell, attrs[i]);
						}
					}
	
					div.appendChild(form.getTable());
					mxUtils.br(div);
				}
			}
			/**
			 * Creates the textfield for the given property.
			 */
			function createTextField(graph, form, cell, attribute)
			{
				var input = form.addText(attribute.nodeName + ':', attribute.nodeValue);
				var applyHandler = function()
				{
					var newValue = input.value || '';
					var oldValue = cell.getAttribute(attribute.nodeName, '');
					if (newValue != oldValue)
					{
						graph.getModel().beginUpdate();
                        
                        try
                        {
                        	var edit = new mxCellAttributeChange(
 		                           cell, attribute.nodeName,
 		                           newValue);
                           	graph.getModel().execute(edit);
                        }
                        finally
                        {
                            graph.getModel().endUpdate();
                        }
					}
				}; 
				mxEvent.addListener(input, 'keypress', function (evt)
				{
					// Needs to take shift into account for textareas
					if (evt.keyCode == /*enter*/13 &&
						!mxEvent.isShiftDown(evt))
					{
						input.blur();
					}
				});
				if (mxClient.IS_IE)
				{
					mxEvent.addListener(input, 'focusout', applyHandler);
				}
				else
				{
					// Note: Known problem is the blurring of fields in
					// Firefox by changing the selection, in which case
					// no event is fired in FF and the change is lost.
					// As a workaround you should use a local variable
					// that stores the focused field and invoke blur
					// explicitely where we do the graph.focus above.
					mxEvent.addListener(input, 'blur', applyHandler);
				}
			}
		};
		
	mxEdgeStyle.WireConnector = function(state, source, target, hints, result)
	{
		// Creates array of all way- and terminalpoints
		var pts = state.absolutePoints;
		var horizontal = true;
		var hint = null;
		
		// Gets the initial connection from the source terminal or edge
		if (source != null && state.view.graph.model.isEdge(source.cell))
		{
			horizontal = state.style['sourceConstraint'] == 'horizontal';
		}
		else if (source != null)
		{
			horizontal = source.style['portConstraint'] != 'vertical';
			
			// Checks the direction of the shape and rotates
			var direction = source.style[mxConstants.STYLE_DIRECTION];
			
			if (direction == 'north' || direction == 'south')
			{
				horizontal = !horizontal;
			}
		}
		
		// Adds the first point
		// TODO: Should move along connected segment
		var pt = pts[0];
		
		if (pt == null && source != null)
		{
			pt = new mxPoint(state.view.getRoutingCenterX(source), state.view.getRoutingCenterY(source));
		}
		else if (pt != null)
		{
			pt = pt.clone();
		}
		
		var first = pt;
		// Adds the waypoints
		if (hints != null && hints.length > 0)
		{
			// FIXME: First segment not movable
			/*hint = state.view.transformControlPoint(state, hints[0]);
			mxLog.show();
			mxLog.debug(hints.length,'hints0.y='+hint.y, pt.y)
			
			if (horizontal && Math.floor(hint.y) != Math.floor(pt.y))
			{
				mxLog.show();
				mxLog.debug('add waypoint');
				pt = new mxPoint(pt.x, hint.y);
				result.push(pt);
				pt = pt.clone();
				//horizontal = !horizontal;
			}*/
			
			for (var i = 0; i < hints.length; i++)
			{
				horizontal = !horizontal;
				hint = state.view.transformControlPoint(state, hints[i]);
				if (horizontal)
				{
					if (pt.y != hint.y)
					{
						pt.y = hint.y;
						result.push(pt.clone());
					}
				}
				else if (pt.x != hint.x)
				{
					pt.x = hint.x;
					result.push(pt.clone());
				}
			}
		}
		else
		{
			hint = pt;
		}
		// Adds the last point
		pt = pts[pts.length - 1];
		// TODO: Should move along connected segment
		if (pt == null && target != null)
		{
			pt = new mxPoint(state.view.getRoutingCenterX(target), state.view.getRoutingCenterY(target));
		}
		if (horizontal)
		{
			if (pt.y != hint.y && first.x != pt.x)
			{
				result.push(new mxPoint(pt.x, hint.y));
			}
		}
		else if (pt.x != hint.x && first.y != pt.y)
		{
			result.push(new mxPoint(hint.x, pt.y));
		}
};
