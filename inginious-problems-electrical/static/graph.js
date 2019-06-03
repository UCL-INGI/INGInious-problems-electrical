function makeGraph(graph, container) {
	// Checks if the browser is supported
	if (!mxClient.isBrowserSupported())
	{
		// Displays an error message if the browser is not supported.
		mxUtils.error('Browser is not supported!', 200, false);
	}
	else
	{
        // Adds an option to view the XML of the graph
        /*var xmlButton = mxUtils.button('View XML', function()
        {
            var encoder = new mxCodec();
            var node = encoder.encode(graph.getModel());
            mxUtils.popup(mxUtils.getPrettyXml(node), true);
        })
        xmlButton.style.position = 'relative';
        document.body.appendChild(xmlButton);*/
		// Disables the built-in context menu
		mxEvent.disableContextMenu(container);
		//The list of xml files
		var stencilsFile = new Array("resistors.xml","signal_sources.xml", "capacitors.xml", "inductors.xml") 
		
		// Overrides method to disallow edge label editing
		graph.isCellEditable = function(cell)
		{
			return !this.getModel().isEdge(cell);
		};

		// Disables automatic handling of ports. This disables the reset of the
		// respective style in mxGraph.cellConnected. Note that this feature may
		// be useful if floating and fixed connections are combined.
		graph.setPortsEnabled(false);		       
		
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
            	var edit = new mxCellAttributeChange(cell, attribute.nodeName, newValue);
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

function addEquation(equCnt, initEquation) {
    var div = document.createElement('div')
    div.id = equCnt[0]
    var equations = document.getElementById('equations');
    equations.appendChild(div)
    var equation = document.createTextNode('Equation '+equCnt[0]+' : ')
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
    equCnt[0]++
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

function setSubmit(graph) {
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
}


function cellLabelStudent(graph) {
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
		            display = makeDisplayV(value, phase)
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
                    display = makeDisplayA(value, phase)
                }
                else if((cell.getAttribute('type', '') == 'VoltageLabel' || cell.getAttribute('type', '') == 'CurrentLabel') && cell.getAttribute('isQuestion', '') == "true") {
                    if(cell.getAttribute('type', '') == 'VoltageLabel') {                               
                        if (cell.getAttribute('isPhase', '') == "true") {
							display = name + "=" + value + '\u2220' + phase + "°V";						
						}
						else {
							display = name + "=" + value + "V";
						}
                    }
                    else {
						if (cell.getAttribute('isPhase', '') == "true") {
							display = name + "=" + value + '\u2220' + phase + "°A";
						}
                        else {
							display = name + "=" + value + "A";
						}
                    }
                }
				else if((cell.getAttribute('type', '') == 'VoltageLabel' || cell.getAttribute('type', '') == 'CurrentLabel') && cell.getAttribute('set', '') == "true") {
                    if(cell.getAttribute('type', '') == 'VoltageLabel') {        
                        display = makeDisplayV(value, phase)
                    }
                    else {
                        display = makeDisplayA(value, phase)
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
}

function makeDisplayA(value, phase) {
	display = value;
	if(phase != 0) {
		display = display + '\u2220' + phase + "°A";
	}
	else {
		display = display + "A";
	}
	return display
}


function makeDisplayV(value, phase) {
	display = value;
	if(phase != 0) {
		display = display + '\u2220' + phase + "°V";
	}
	else {
		display = display + "V";
	}
	return display
}


function cellLabelEdit(graph) {
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
		        if(cell.getAttribute('type', '') == 'Voltage') {
		            return value + '\u2220' + phase + "°V";
                }
                else if(cell.getAttribute('type', '') == 'Resistor') {
                    return value + '\u03A9';
                }
                else if(cell.getAttribute('type', '') == 'Capacitor') {
                    return '-j' + value + '\u03A9';
                }
                else if(cell.getAttribute('type', '') == 'Inductor') {
                    return 'j' + value + '\u03A9';
                }
                else if(cell.getAttribute('type', '') == 'Current') {
                    return value + '\u2220' + phase + '°A';
                }
                else if(cell.getAttribute('type', '') == 'DependentVoltage' || cell.getAttribute('type', '') == 'DependentCurrent') {
                    var dependency = cell.getAttribute('label', '');
                    return value + dependency;                                    
                }
                else if((cell.getAttribute('type', '') == 'VoltageLabel' || cell.getAttribute('type', '') == 'CurrentLabel') && cell.getAttribute('set', '') == "true") {
                    return value + '\u2220' + phase + '°V';
                }
                else {
                    return name;
                }
	        }
        }
        return '';
    };
}


function settingsStudent(graph) {
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
}


function settingsEdit(graph) {
	// Delete the selected cells (keyboard delete)
    document.addEventListener('keydown', function (e) {
        if(e.key == "Delete") 
            graph.removeCells();
    }, false); 

	//Maximum size
    graph.maximumGraphBounds = new mxRectangle(0, 0, 1800, 1600)
    graph.border = 50;
    var styleV = graph.getStylesheet().getDefaultVertexStyle();
    styleV[mxConstants.STYLE_FONTSIZE] = 15
    styleV['fontColor'] = '#000000';
    styleV['movable'] = '1';
    styleV['resizable'] = '0';
    styleV[mxConstants.STYLE_STROKECOLOR] = '#000000';
    styleV[mxConstants.STYLE_FILLCOLOR] = '#FFFFFF';
    styleV[mxConstants.STYLE_STROKEWIDTH] = 1.5;
    var styleE = graph.getStylesheet().getDefaultEdgeStyle();
    delete styleE['endArrow'];
    styleE['strokeColor'] = '#000000'
    styleE[mxConstants.STYLE_STROKEWIDTH] = 1.5;
    styleE['movable'] = '1';
    styleE['resizable'] = '0';
    styleE['edgeStyle'] = 'wireEdgeStyle';
    styleE['fontSize'] = '9';
    // Enables rubberband selection
    new mxRubberband(graph);
}


function panelStudent(graph, labelNames) {
	// Implements a properties panel that uses
	// mxCellAttributeChange to change properties
	graph.getSelectionModel().addListener(mxEvent.CHANGE, function(sender, evt)
	{
		selectionChanged(graph);
	});
	selectionChanged(graph);
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
                    if(attrs[i].nodeName != 'type' && attrs[i].nodeName != 'name' && attrs[i].nodeName != 'isQuestion' && attrs[i].nodeName != 'set' && attrs[i].nodeName != 'hidden_real' && attrs[i].nodeName != 'hidden_imaginary' && attrs[i].nodeName != 'isPhase' && attrs[i].nodeName != 'phase' || attrs[i].nodeName == 'phase' && cell.value.getAttribute("isPhase") == 'true') { 
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
}


function panelEdit(graph) {
	// Implements a properties panel that uses
    // mxCellAttributeChange to change properties
    graph.getSelectionModel().addListener(mxEvent.CHANGE, function(sender, evt)
    {
        selectionChanged(graph);
    });
    selectionChanged(graph);
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
        if (cell != null && cell.value != null && cell.value.nodeName.toLowerCase() == 'component')
        {
	        // Writes the title
	        var center = document.createElement('center');
	        mxUtils.writeln(center, 'Editing');
	        div.appendChild(center);
	        mxUtils.br(div);
	        // Creates the form from the attributes of the user object
	        var form = new mxForm();

	        var attrs = cell.value.attributes;
	
	        for (var i = 0; i < attrs.length; i++)
	        {	
                if(cell.value.getAttribute('type', '') == "VoltageLabel" || cell.value.getAttribute('type', '') == "CurrentLabel") {
                    if(attrs[i].nodeName == "name") {
                        createTextField(graph, form, cell, attrs[i]);
                    }
                    if(cell.value.getAttribute('set', '') == 'true' && (attrs[i].nodeName == 'value' || attrs[i].nodeName == 'phase')) {
                        createTextField(graph, form, cell, attrs[i]);
                    }
                }
                else if(cell.value.getAttribute('type', '') == "Impedance") {
                    if(attrs[i].nodeName == "name" || attrs[i].nodeName == "hidden_real" || attrs[i].nodeName == "hidden_imaginary") {
                        createTextField(graph, form, cell, attrs[i]);
                    }
                }
		        else if(attrs[i].nodeName != 'type' && attrs[i].nodeName != 'name') {
			        createTextField(graph, form, cell, attrs[i]);
		        }
	        }

	        div.appendChild(form.getTable());

            if(cell.value.getAttribute('type', '') == "VoltageLabel" || cell.value.getAttribute('type', '') == "CurrentLabel") {
				var tbl = document.createElement('table');
				tbl.style.width = '100%';
				var tbdy = document.createElement('tbody');
				var tr = document.createElement('tr');
                // checkbox to make the label a question for the student
                var isQuestion = document.createElement("INPUT");
                isQuestion.type = "checkbox";
                isQuestion.id = "iQ"
                isQuestion.style.marginTop = '10px';
                isQuestion.checked = cell.value.getAttribute('isQuestion', '') == "true";
                isQuestion.onclick = function() {
                    graph.getModel().beginUpdate();
                    try
                    {
                        if ( this.checked ) {
                            set.checked = false
                    	    var edit = new mxCellAttributeChange(cell, 'isQuestion', 'true');
                            graph.getModel().execute(new mxCellAttributeChange(cell, 'set', 'false'));
                            graph.getModel().execute(new mxCellAttributeChange(cell, 'value', '?'));
							if (cell.value.getAttribute('isPhase', '') == "true") {
                            	graph.getModel().execute(new mxCellAttributeChange(cell, 'phase', '?'));
							}
                        } else {
                    	    var edit = new mxCellAttributeChange(cell, 'isQuestion', 'false');
                        }
                       	graph.getModel().execute(edit); // trigger the modification of the graph
                    }
                    finally
                    {
                        graph.getModel().endUpdate();
                    }
                    selectionChanged(graph) // remove value and phase input
                };
				var td1 = document.createElement('td');
                td1.appendChild(isQuestion);
                td1.appendChild(document.createTextNode('Question'));
				tr.appendChild(td1)

                // checkbox to set the value and phase of the label
                var set = document.createElement("INPUT");
                set.type = "checkbox";
                set.id = "s"
                set.style.marginTop = '10px';
                set.checked = cell.value.getAttribute('set', '') == "true";
                set.onclick = function() {
                    graph.getModel().beginUpdate();
                    try
                    {
                        if ( this.checked ) {
                            isQuestion.checked = false                              
                            createTextField(graph, form, cell, attrs[1]);
                            createTextField(graph, form, cell, attrs[2]);
                    	    var edit = new mxCellAttributeChange(cell, 'set', 'true');
                            graph.getModel().execute(new mxCellAttributeChange(cell, 'isQuestion', 'false'));
                        } else {
                    	    var edit = new mxCellAttributeChange(cell, 'set', 'false');
                        }
                       	graph.getModel().execute(edit); // trigger the modification of the graph
                    }
                    finally
                    {
                        graph.getModel().endUpdate();
                    }
                    selectionChanged(graph) // remove value and phase input
                };
				var td2 = document.createElement('td');
                td2.appendChild(set);
                td2.appendChild(document.createTextNode('Set'));
				tr.appendChild(td2)

				// checkbox to make the label with a phase or not
				var isPhase = document.createElement("INPUT");
                isPhase.type = "checkbox";
                isPhase.id = "ph"
                isPhase.style.marginTop = '10px';
                isPhase.checked = cell.value.getAttribute('isPhase', '') == "true";
                isPhase.onclick = function() {
                    graph.getModel().beginUpdate();
                    try
                    {
                        if ( this.checked ) {                              
                    	    var edit = new mxCellAttributeChange(cell, 'isPhase', 'true');
                            graph.getModel().execute(new mxCellAttributeChange(cell, 'phase', '?'));
                        } else {
                    	    var edit = new mxCellAttributeChange(cell, 'isPhase', 'false');
                            graph.getModel().execute(new mxCellAttributeChange(cell, 'phase', '0'));
                        }
                       	graph.getModel().execute(edit); // trigger the modification of the graph
                    }
                    finally
                    {
                        graph.getModel().endUpdate();
                    }
                    selectionChanged(graph) // remove value and phase input
                };
				var td3 = document.createElement('td');
                td3.appendChild(isPhase);
                td3.appendChild(document.createTextNode('Phase'));
				tr.appendChild(td3);
				
				tbdy.appendChild(tr);
				
				tbl.appendChild(tbdy);
				div.appendChild(tbl);
                
                // button to switch the type of the label (voltage/current)
                var switchButton = mxUtils.button('Switch type', function()
                {
                    graph.getModel().beginUpdate();
                    if(cell.getStyle().split(';')[0] == 'shape=VoltageLabel') {
                        graph.setCellStyles(mxConstants.STYLE_SHAPE, 'CurrentLabel', [cell])
                        cell.geometry.width = 80
                        cell.geometry.height = 20
                        graph.setCellStyles(mxConstants.STYLE_VERTICAL_ALIGN, 'bottom', [cell])
                        graph.setCellStyles(mxConstants.STYLE_VERTICAL_LABEL_POSITION, 'top', [cell])
                        var edit = new mxCellAttributeChange(cell, 'type', 'CurrentLabel');
                    }
                    else if(cell.getStyle().split(';')[0] == 'shape=CurrentLabel') {
                        graph.setCellStyles(mxConstants.STYLE_SHAPE, 'VoltageLabel', [cell])
                        cell.geometry.width = 30  
                        cell.geometry.height = 60 
                        graph.setCellStyles(mxConstants.STYLE_VERTICAL_ALIGN, 'none', [cell])
                        graph.setCellStyles(mxConstants.STYLE_VERTICAL_LABEL_POSITION, 'none', [cell])
                        var edit = new mxCellAttributeChange(cell, 'type', 'VoltageLabel');
                    }
                    graph.getModel().execute(edit); // trigger the modification of the graph
                    graph.getModel().endUpdate();
                })
                switchButton.style.position = 'relative';
                switchButton.style.top = '10px';
                switchButton.style.left = '25px';
                switchButton.addEventListener('click', event => event.preventDefault());
                div.appendChild(switchButton);       
            }                  


            var rotateButton = mxUtils.button('Rotate 90', function()
            {
                var cell = graph.getSelectionCell();
                var currentRotation = mxUtils.getValue(graph.view.getState(cell).style,mxConstants.STYLE_ROTATION,0);
                graph.setCellStyles(mxConstants.STYLE_ROTATION, currentRotation+90, [cell])

                //problem alignement on grid
                if(cell.getStyle().split(';')[0] == 'shape=Inductor 5') {
                    graph.setCellStyles(mxConstants.STYLE_SHAPE, 'Inductor 5V', [cell])
                }
                else if(cell.getStyle().split(';')[0] == 'shape=Inductor 5V') {
                    graph.setCellStyles(mxConstants.STYLE_SHAPE, 'Inductor 5', [cell])
                }
				if(cell.getStyle().split(';')[0] == 'shape=CurrentLabel' && (currentRotation+90)%360 == 180) {
                    graph.setCellStyles(mxConstants.STYLE_SHAPE, 'CurrentLabelReverse', [cell])
					graph.setCellStyles(mxConstants.STYLE_ROTATION, 0, [cell])
                }
                else if(cell.getStyle().split(';')[0] == 'shape=CurrentLabelReverse') {
                    graph.setCellStyles(mxConstants.STYLE_SHAPE, 'CurrentLabel', [cell])
					graph.setCellStyles(mxConstants.STYLE_ROTATION, 270, [cell])
                }
            })
            rotateButton.style.position = 'relative';
            rotateButton.style.top = '10px';
            rotateButton.style.left = '30px';
            rotateButton.addEventListener('click', event => event.preventDefault());
            div.appendChild(rotateButton);                    
            
	        mxUtils.br(div);
        }
    }
}

function nodeName(graph, labelNames, divButtons) {
	// add node name 
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
}


function makeEquation(graph, divButtons, equCnt) {
	// add a new equation
    var nodeButton = mxUtils.button('New equation', function()
    {
        addEquation(equCnt, '');
    })
    nodeButton.style.position = 'relative';
    nodeButton.addEventListener('click', event => event.preventDefault());
    divButtons.appendChild(nodeButton);
}	


function toolBar(graph) {
	// add component to the toolbar
    var addVertex = function(icon, w, h, style, type, counts)
    {

        var img = addToolbarItem(graph, toolbar, icon, doc, w, h, style, type, counts);
        img.enabled = true;

        graph.getSelectionModel().addListener(mxEvent.CHANGE, function()
        {
	        var tmp = graph.isSelectionEmpty();
	        img.enabled = tmp;
        });
    };

	// Creates new toolbar without event processing
    var toolbar = new mxToolbar(tbContainer);
    toolbar.enabled = false
    var counts = [counter(graph, 'Resistor')+1, counter(graph, 'Capacitor')+1, counter(graph, 'Voltage')+1, counter(graph, 'Inductor')+1, counter(graph, 'Current')+1, counter(graph, 'VoltageLabel')+1, counter(graph, 'DependentVoltage')+1, counter(graph, 'DependentCurrent')+1, counter(graph, 'Impedance')+1]
    var doc = mxUtils.createXmlDocument();
    addVertex('/plugins/electrical/static/images/resistor.png', 80, 20, 'shape=Resistor 2;verticalLabelPosition=top;verticalAlign=bottom;', 'Resistor', counts);
    addVertex('/plugins/electrical/static/images/capacitor.png', 80, 40, 'shape=Capacitor 1;verticalLabelPosition=top;verticalAlign=bottom;', 'Capacitor', counts);
    addVertex('/plugins/electrical/static/images/inductor.png', 80, 31, 'shape=Inductor 5;verticalLabelPosition=top;verticalAlign=bottom;', 'Inductor', counts);                
    addVertex('/plugins/electrical/static/images/voltage.png', 40, 40, 'shape=DC Source 3;verticalLabelPosition=top;verticalAlign=bottom;', 'Voltage', counts);	              
    addVertex('/plugins/electrical/static/images/dependentVoltage.png', 40, 40, 'shape=Dependent Source 3;verticalLabelPosition=top;verticalAlign=bottom;', 'DependentVoltage', counts);		
    addVertex('/plugins/electrical/static/images/current.png', 40, 40, 'shape=DC Source 2;verticalLabelPosition=top;verticalAlign=bottom;', 'Current', counts);			
    addVertex('/plugins/electrical/static/images/dependentCurrent.png', 40, 40, 'shape=Dependent Source 2;verticalLabelPosition=top;verticalAlign=bottom;', 'DependentCurrent', counts);		
    addVertex('/plugins/electrical/static/images/label.png', 30, 60, 'shape=VoltageLabel;', 'VoltageLabel', counts);	
    addVertex('/plugins/electrical/static/images/impedance.png', 80, 20, 'shape=Impedance;', 'Impedance', counts);			
    addVertex('/plugins/electrical/static/images/ground.png', 20, 20, 'shape=Signal Ground;', 'Ground', counts);	
}


function counter(graph, type) {
    var count = 0; 
    var mxcell = Object.values(graph.view.getStates().map)
    for(var i = 0; i < mxcell.length; i++){
        var value = mxcell[i].cell.value;
        if(typeof value !== 'undefined' && value != null && value.getAttribute('type', '') == type) {
            count++;
        }
    }
    return count;
}

function addToolbarItem(graph, toolbar, image, doc, w, h, style, type, counts)
{
    // Function that is executed when the image is dropped on
    // the graph. The cell argument points to the cell under
    // the mousepointer if there is one.
    var funct = function(graph, evt, cell, x, y)
    {
        graph.stopEditing(false); 
        var color = '#000000';  

        switch(type) {
            case 'Resistor':
                name = 'R'+counts[0]
                color = '#4500BB';
                counts[0] += 1
                break;
            case 'Capacitor':
                name = 'C'+counts[1]
                color = '#EE44EE';
                counts[1] += 1
                break;
            case 'Voltage':
                name = 'V'+counts[2]
                color = '#C02020';
                counts[2] += 1
                break;
            case 'Inductor':
                name = 'L'+counts[3]
                color = '#990099';
                counts[3] += 1
                break;
            case 'Current':
                name = 'I'+counts[4]
                color = '#8B4513';
                counts[4] += 1
                break;
            case 'VoltageLabel':
            	name = 'Label'+counts[5]
                color = '#A0A0A0';
                counts[5] += 1
            	break;
            case 'DependentVoltage' :
                name = 'DV'+counts[6]
                color = '#C02020';
                counts[6] += 1
                break;
            case 'DependentCurrent' :
                name = 'DC'+counts[7]
                color = '#8B4513';
                counts[7] += 1
                break;
            case 'Impedance' :
                name = 'Z'+counts[8]
                color = '#AAAA00'
                counts[8] += 1
                break;
            default:
                console.log("name unknown")
        } 
    

        var c;
        if(type == "Ground") {
            c = doc.createElement('Ground');
        }
        else {
            c = doc.createElement('Component');
            c.setAttribute('name', name);
            if(type == 'Impedance') {
                c.setAttribute('real', '0');
                c.setAttribute('imaginary', '0');
				c.setAttribute('hidden_real', 0);
				c.setAttribute('hidden_imaginary', 0);
            }
            if(type != 'VoltageLabel' && type != 'Impedance') {
                c.setAttribute('value', '0');
            }
            if(type == 'Voltage' || type == 'Current') {
                c.setAttribute('phase', '0');
            }     
            if(type == 'DependentVoltage' || type == 'DependentCurrent') {
                c.setAttribute('label', '?')                        
            }
            if(type == 'VoltageLabel') {
                c.setAttribute('value', '?')    
                c.setAttribute('phase', '?')  
                c.setAttribute('isQuestion', "true")  
                c.setAttribute('isPhase', "true") 
                c.setAttribute('set', "false")              
            }
            c.setAttribute('type', type);   
        }     
        parent = graph.getDefaultParent();
        var v = graph.insertVertex(parent, null, c, x, y, w, h, style+"strokeColor="+color+";");     
        graph.setSelectionCell(v);
    }

    // Creates the image which is used as the drag icon (preview)
    var img = toolbar.addMode(null, image, function(evt, cell)
    {
        var pt = this.graph.getPointForEvent(evt);
        funct(graph, evt, cell, pt.x, pt.y);
    });

    // Disables dragging if element is disabled. This is a workaround
    // for wrong event order in IE. Following is a dummy listener that
    // is invoked as the last listener in IE.
    mxEvent.addListener(img, 'mousedown', function(evt)
    {
        // do nothing
    });

    // This listener is always called first before any other listener
    // in all browsers.
    mxEvent.addListener(img, 'mousedown', function(evt)
    {
        if (img.enabled == false)
        {
	        mxEvent.consume(evt);
        }
    });
		
    mxUtils.makeDraggable(img, graph, funct);

    return img;
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

mxStyleRegistry.putValue('wireEdgeStyle', mxEdgeStyle.WireConnector);

// This connector needs an mxEdgeSegmentHandler
mxGraphCreateHandler = mxGraph.prototype.createHandler;
mxGraph.prototype.createHandler = function(state)
{
    var result = null;
    
    if (state != null)
    {
        if (this.model.isEdge(state.cell))
        {
	        var style = this.view.getEdgeStyle(state);
	        
	        if (style == mxEdgeStyle.WireConnector)
	        {
		        return new mxEdgeSegmentHandler(state);
	        }
        }
    }
    
    return mxGraphCreateHandler.apply(this, arguments);
};
