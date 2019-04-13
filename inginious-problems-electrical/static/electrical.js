function load_input_electrical(submissionid, key, input) { 
    if(key in input) {
        document.getElementById('graphContainer').innerHTML = "";  // clean the older graph
        document.getElementById('buttons').innerHTML = ""; // clean the older buttons
		// clean the older equations
		var i = 1
		while(i < document.getElementById('equations').childNodes.length){
			var element = document.getElementById('equations').childNodes[i]
			element.parentNode.removeChild(element)
			i++
		}

        oldSubmission(document.getElementById('graphContainer'), input[key], input["equations"]);
    }
    else
        console.log("pas de xml");
}

function studio_init_template_electrical(well, pid, problem)
{   
    if("circuit" in problem)
        $('#circuit-' + pid, well).val(problem["circuit"]);
    if("input_cycle" in problem)
        $('#input_cycle-' + pid, well).val(problem["input_cycle"]);
    if("input_direct" in problem)
        $('#input_direct-' + pid, well).prop('checked', problem["input_direct"] == "on");
    if("input_reverse" in problem)
        $('#input_reverse-' + pid, well).prop('checked', problem["input_reverse"] == "on");
}

function oldSubmission(container, xmlText, equationString)
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
		//The list of xml files
		var stencilsFile = new Array("resistors.xml","signal_sources.xml", "capacitors.xml", "inductors.xml") 
		
		// Creates the graph inside the given container
		var graph = new mxGraph(container);
        graph.setConnectable(false);
        new mxKeyHandler(graph);
		
        // send xml of the graph and equations in the inputs when submit
		jQuery(document).ready(function(){
			jQuery("#task-submit").click(function(){
                //graph
				var encoder = new mxCodec();
				var node = encoder.encode(graph.getModel());
				jQuery("#value-submit").val(mxUtils.getPrettyXml(node));
                //equations
                var i = 1
                jQuery("#equations-submit").val('') //clean
                while(i < document.getElementById('equations').childNodes.length){
                    var val = jQuery("#equations-submit").val();
                    if(val != '') {
                        val = val + ' NextEquation '                            
                    }
                    // id1 ID equation1 NextEquation id2 ID equation2 NextEquation id3 ... 
                    jQuery("#equations-submit").val(val + document.getElementById('equations').childNodes[i].id + ' ID ' + document.getElementById('equations').childNodes[i].childNodes[1].value);
                    i++;
                }
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
                    var phase = cell.getAttribute('phase', '');
                    var currentName = ''
                    if(typeof cell.getAttribute('currentName') !== 'undefined' && cell.getAttribute('currentName') != "") {
                        currentName = cell.getAttribute('currentName');
                    }
                    var display = "";

			        if(cell.getAttribute('type', '') == 'Voltage') {
			            display = value + '\u2220' + phase + "°V";
                    }
                    else if(cell.getAttribute('type', '') == 'Resistor') {
                        display = value + '\u03A9';
                    }
                    else if(cell.getAttribute('type', '') == 'Capacitor') {
                        display = '-j' + value + '\u03A9';
                    }
                    else if(cell.getAttribute('type', '') == 'Inductor') {
                        display = 'j' + value + '\u03A9';
                    }
                    else if(cell.getAttribute('type', '') == 'Current') {
                        display = value + '\u2220' + phase + '°A';
                    }
                    else if((cell.getAttribute('type', '') == 'VoltageLabel' || cell.getAttribute('type', '') == 'CurrentLabel') && cell.getAttribute('isQuestion', '') == "true") {
                        if(cell.getAttribute('type', '') == 'VoltageLabel') {                               
                            display = name + " = " + value + '\u2220' + phase + '°V';
                        }
                        else {
                            display = name + " = " + value + '\u2220' + phase + '°A';
                        }
                    }
					else if((cell.getAttribute('type', '') == 'VoltageLabel' || cell.getAttribute('type', '') == 'CurrentLabel') && cell.getAttribute('set', '') == "true") {
                        if(cell.getAttribute('type', '') == 'VoltageLabel') {        
                            display = value + '\u2220' + phase + '°V';
                        }
                        else {
                            display = value + '\u2220' + phase + '°A';
                        }
                    }
                    else if(cell.getAttribute('type', '') == 'DependentVoltage' || cell.getAttribute('type', '') == 'DependentCurrent') {
                        var dependency = cell.getAttribute('label', '');
                        display = value + dependency;                                    
                    }
                    else {
                        display = name;
                    }
                    
                    if(currentName != '') {
                        return display + "(" + currentName + cell.getAttribute('direction') + ")";
                    }
                    else {
                        return display;
                    }
		        }
	        }
	        return '';
        };
	
	    // Disables automatic handling of ports. This disables the reset of the
	    // respective style in mxGraph.cellConnected. Note that this feature may
	    // be useful if floating and fixed connections are combined.
	    graph.setPortsEnabled(false);
		
        //Maximum size
        graph.maximumGraphBounds = new mxRectangle(0, 0, 1800, 1600)
        graph.border = 50;
        var styleV = graph.getStylesheet().getDefaultVertexStyle();
        styleV[mxConstants.STYLE_FONTSIZE] = 15
        styleV['fontColor'] = '#000000';
        styleV['movable'] = '0';
        styleV['resizable'] = '0';
        styleV[mxConstants.STYLE_STROKECOLOR] = '#000000';
        styleV[mxConstants.STYLE_FILLCOLOR] = '#FFFFFF';
        styleV[mxConstants.STYLE_STROKEWIDTH] = 1.5;
        var styleE = graph.getStylesheet().getDefaultEdgeStyle();
        delete styleE['endArrow'];
        styleE['strokeColor'] = '#000000'
        styleE[mxConstants.STYLE_STROKEWIDTH] = 1.5;
        styleE['movable'] = '0';
        styleE['resizable'] = '0';
        styleE['bendable'] = '0';
        styleE['edgeStyle'] = 'wireEdgeStyle';
        styleE['clickable'] = '0';
        styleE['fontSize'] = '9';
        // Enables rubberband selection
        new mxRubberband(graph);
		       
		
        // Disables floating connections (only connections via ports allowed)
	    graph.connectionHandler.isConnectableCell = function(cell)
	    {
	        return false;
	    };
        // Allow connection between two port with the same name (ex: IN-IN or OUT-OUT)
        graph.connectionHandler.checkConstraints = function(c1, c2)
	    {
	        return true;
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
        
	
	    // Sets the port for the given connection
	    graph.setConnectionConstraint = function(edge, terminal, source, constraint)
	    {
		    if (constraint != null)
		    {
			    var key = (source) ? mxConstants.STYLE_SOURCE_PORT : mxConstants.STYLE_TARGET_PORT;
			
			    if (constraint == null || constraint.name == null)
			    {
				    this.setCellStyles(key, null, [edge]);
			    }
			    else if (constraint.name != null)
			    {
				    this.setCellStyles(key, constraint.name, [edge]);
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


        // add node name 
        var divButtons = document.getElementById('buttons');
        var doc = mxUtils.createXmlDocument();
	    var modeAddNode = false;
        var nodeCnt = 1;
	    var nodeButton = mxUtils.button('New node name', function()
        {
            modeAddNode = true;
            changeEdgeColor(graph, "#11CC11")
        })
        nodeButton.style.position = 'relative';
        nodeButton.addEventListener('click', event => event.preventDefault());
        divButtons.appendChild(nodeButton);
        
        graph.addListener(mxEvent.CLICK, function(sender, evt){
            if (modeAddNode) {
                var cell = evt.getProperty('cell');
                if (cell!=null){
	                if (cell.edge!=null && cell.edge==1){
		                var c = doc.createElement('Component');
                        while(labelNames.includes("V"+nodeCnt)){
                            nodeCnt++;                                
                        }
                        c.setAttribute('name', "V"+nodeCnt++);
                        c.setAttribute('type', 'Node');        
                        parent = graph.getDefaultParent();
                        var v = graph.insertVertex(parent, null, c, sender.lastEvent.layerX-5, sender.lastEvent.layerY-5, 10, 10, 'shape=node;verticalLabelPosition=top;verticalAlign=bottom;fillColor=#000000;');
                        var e = graph.insertEdge(parent, null, null, v, cell.source, 'sourcePort=N;entryPerimeter=0;targetPort='+cell.getStyle().split(';')[0].split('=')[1]+';');
                        graph.getModel().beginUpdate();
                        graph.getModel().setVisible(e, false)
                        graph.getModel().endUpdate();
                        modeAddNode = false;
                        changeEdgeColor(graph, "#000000")
	                }
                }
                else {
                    modeAddNode = false;
                    changeEdgeColor(graph, "#000000")
                }
            }
        });

        

        // add a new equation
        var equCnt = 1
        var nodeButton = mxUtils.button('New equation', function()
        {
            addEquation(equCnt, '');
        })
        nodeButton.style.position = 'relative';
        nodeButton.addEventListener('click', event => event.preventDefault());
        divButtons.appendChild(nodeButton);
        
					
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

		// recovery of the graph and equations of the student
        mxVertexHandler.prototype.rotationEnabled = true;
        var parser = new DOMParser();
        xml = parser.parseFromString(xmlText, "text/xml");
        var root = xml.documentElement;
        var dec = new mxCodec(root.ownerDocument);
        dec.decode(root, graph.getModel());
        mxVertexHandler.prototype.rotationEnabled = false;
        if (equationString != "") {
            equations = equationString.split(' NextEquation ')
		    for(var i = 0; i < equations.length; i++) {
                equCnt = equations[i].split(' ID ')[0]
                initEquation = equations[i].split(' ID ')[1]
                addEquation(equCnt, initEquation)
                equCnt++ 
            }
        }
		

        var labelNames = getLabelNames(graph)
		
	    // Implements a properties panel that uses
		// mxCellAttributeChange to change properties
		graph.getSelectionModel().addListener(mxEvent.CHANGE, function(sender, evt)
		{
			selectionChanged(graph);
		});
		selectionChanged(graph);
        
        // don't allow the student to modify edge
        mxGraph.prototype.isCellSelectable = function(cell)
        {
            if (cell.edge!=null && cell.edge==1){
                return false;                
            }
            else {
                return true;                    
            }
        };

        }
	/**
	 * Updates the properties panel
	 */
    var currentCnt = 1;
	function selectionChanged(graph)
	{
		var div = document.getElementById('properties');
		// Forces focusout in IE
		graph.container.focus();
		// Clears the DIV the non-DOM way
		div.innerHTML = '';
		// Gets the selection cell
		var cell = graph.getSelectionCell();
        if(cell != null && cell.value != null) {
		    if(((cell.value.getAttribute("type") == 'VoltageLabel' || cell.value.getAttribute("type") == 'CurrentLabel') && cell.value.getAttribute("isQuestion") == 'true') || cell.value.getAttribute("type") == 'Impedance')
		    {
			    // Writes the title
			    var center = document.createElement('center');
			    mxUtils.writeln(center, 'Answer');
			    div.appendChild(center);
			    mxUtils.br(div);
			    // Creates the form from the attributes of the user object
			    var form = new mxForm();
			    var attrs = cell.value.attributes;					
			    for (var i = 0; i < attrs.length; i++)
			    {	
                    if(attrs[i].nodeName != 'type' && attrs[i].nodeName != 'name' && attrs[i].nodeName != 'isQuestion' && attrs[i].nodeName != 'set' && attrs[i].nodeName != 'hidden_real' && attrs[i].nodeName != 'hidden_imaginary') { 
                        createTextField(graph, form, cell, attrs[i]);
                    }
			    }

			    div.appendChild(form.getTable());         
                
			    mxUtils.br(div);
		    }
            else if(cell.value.getAttribute("type") != 'Current' && cell.value.getAttribute("type") != 'DependentCurrent' && cell.value.getAttribute("type") != 'VoltageLabel' && cell.value.getAttribute("type") != 'CurrentLabel' && cell.value.getAttribute("type") != 'Node' && cell.value.nodeName.toLowerCase() == 'component'){
                // Writes the title
			    var left = document.createElement('left');
			    mxUtils.writeln(left, 'Current Name');
			    div.appendChild(left);
                // checkbox to add a current name
                var addCurrentName = document.createElement("INPUT");
                addCurrentName.type = "checkbox";
                addCurrentName.id = "CN"
                addCurrentName.style.marginTop = '10px';
                // switch the direction of the current
                var switchDirectionButton = mxUtils.button('Switch direction', function() 
                {
                    graph.getModel().beginUpdate();
                    if(cell.getAttribute("direction", "") == "->") {
                        var edit = new mxCellAttributeChange(cell, 'direction', "<-");
                    } else {
                        var edit = new mxCellAttributeChange(cell, 'direction', "->");
                    }
                    graph.getModel().execute(edit);
                    graph.getModel().endUpdate();
                })
                switchDirectionButton.addEventListener('click', event => event.preventDefault());
                switchDirectionButton.id = "sdb"
                
                addCurrentName.onclick = function() {
                    graph.getModel().beginUpdate();
                    if ( this.checked ) {
                        while(labelNames.includes("I"+currentCnt)){
                            currentCnt++;                                
                        }
                        cell.setAttribute("direction", "->")
                        var edit = new mxCellAttributeChange(cell, 'currentName', "I"+currentCnt); 
                        currentCnt++;
                        div.appendChild(switchDirectionButton)
                    } else {
                        var edit = new mxCellAttributeChange(cell, 'currentName', "");
                        document.getElementById("sdb").remove();
                    }
                    graph.getModel().execute(edit);
                    graph.getModel().endUpdate();
                };
                div.appendChild(addCurrentName);
                div.appendChild(document.createTextNode('add name'));

                if(typeof cell.getAttribute('currentName') !== 'undefined' && cell.getAttribute('currentName') != "") {
                    addCurrentName.checked = true;
                    div.appendChild(switchDirectionButton)
                }
            }
        }
	}
	/**
	 * Creates the textfield for the given property.
	 */
	function createTextField(graph, form, cell, attribute)
	{
		var name = attribute.nodeName
		if (name == "value") {name = "magnitude"} // assitant want a better name
		var input = form.addText(name + ':', attribute.nodeValue);
        input.size = 10;
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
                evt.preventDefault();
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

function addEquation(equCnt, initEquation) {
    var div = document.createElement('div')
    div.id = equCnt
    var equations = document.getElementById('equations');
    equations.appendChild(div)
    var equation = document.createTextNode('Equation '+equCnt+' : ')
    var equationBox = document.createElement('input');
    equationBox.type = 'text';
    equationBox.name = 'equation';
    equationBox.style.width = '800px';
    mxEvent.addListener(equationBox, 'keypress', function (evt)
    {
	    if (evt.keyCode == /*enter*/13)
	    {
            evt.preventDefault();
	    }
    });
    div.appendChild(equation);
    div.appendChild(equationBox);

    equationBox.value = initEquation
    
    var removeButton = mxUtils.button('Remove', function() 
    {
        document.getElementById(div.id).remove();
    })
    removeButton.addEventListener('click', event => event.preventDefault());
    div.appendChild(removeButton)

    var phaseSignButton = mxUtils.button('∠', function() 
    {
        var cursorPosition = equationBox.selectionStart
        var equation = equationBox.value
        equationBox.value = equation.substring(0, cursorPosition)+'∠'+equation.substring(cursorPosition)
        equationBox.focus()
        equationBox.setSelectionRange(cursorPosition+1, cursorPosition+1)
    })
    phaseSignButton.addEventListener('click', event => event.preventDefault());
    phaseSignButton.style.marginBottom = '50px';
    div.appendChild(phaseSignButton)
    equCnt++
}

function getLabelNames(graph) {
    var labelNames = []; 
    var mxcell = Object.values(graph.view.getStates().map)
    for(var i = 0; i < mxcell.length; i++){
        var value = mxcell[i].cell.value;
        if(typeof value !== 'undefined' && value != null && (value.getAttribute('type', '') == "VoltageLabel" || value.getAttribute('type', '') == "CurrentLabel")) {
            labelNames.push(value.getAttribute('name', ''));
        }
    }
    return labelNames;
}

function changeEdgeColor(graph, color) {
    var mxcell = Object.values(graph.view.getStates().map)
    for(var i = 0; i < mxcell.length; i++){
        if(mxcell[i].cell.edge) {
            var style = graph.getModel().getStyle(mxcell[i].cell)
            graph.getModel().beginUpdate();
            graph.getModel().setStyle(mxcell[i].cell, style+";strokeColor="+color+";");
            graph.getModel().endUpdate();
        }
    }
}
	
mxEdgeStyle.WireConnector = function(state, source, target, hints, result)
{
    // if the target is null, create directly the wire
    if(target == null) {
        return        
    }
    
	// Creates array of all way- and terminalpoints
	var pts = state.absolutePoints;
	var horizontal = true;
	var hint = null;

    // make edges grey if connected to a VoltageLabel
    if(target.style.shape == "VoltageLabel" || source.style.shape == "VoltageLabel") {
        state.style.strokeColor = "#A0A0A0"
        state.view.graph.orderCells('back', [state.cell])
    }
    else {
        //state.style.strokeColor = "#000000"  //modeAddNode don't make edges green otherwise 
    }
	
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
		hint = state.view.transformControlPoint(state, hints[0]);
		
		if (horizontal && Math.floor(hint.y) != Math.floor(pt.y))
		{
			pt = new mxPoint(pt.x, hint.y);
			result.push(pt);
			pt = pt.clone();
			//horizontal = !horizontal;
		}
		
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
