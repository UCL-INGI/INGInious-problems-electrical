function load_input_electrical(submissionid, key, input) { 
    if(key in input) {
        document.getElementById('graphContainer').innerHTML = "";  // clean the older graph
        document.getElementById('buttons').innerHTML = ""; // clean the older buttons
		// clean the older equations
		while(1 < document.getElementById('equations').childNodes.length){
			var element = document.getElementById('equations').childNodes[1]
			element.parentNode.removeChild(element)
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
	// Creates the graph inside the given container
	var graph = new mxGraph(container);
    graph.setConnectable(false);
    new mxKeyHandler(graph);
	
	makeGraph(graph, container);
		
	cellLabelStudent(graph);

	settingsStudent(graph);

	// recovery of the graph and equations of the student
    mxVertexHandler.prototype.rotationEnabled = true;
    var equCnt = [1]
    var parser = new DOMParser();
    xml = parser.parseFromString(xmlText, "text/xml");
    var root = xml.documentElement;
    var dec = new mxCodec(root.ownerDocument);
    dec.decode(root, graph.getModel());
    mxVertexHandler.prototype.rotationEnabled = false;
    if (equationString != "") {
        equations = equationString.split(' NextEquation ')
	    for(var i = 0; i < equations.length; i++) {
            equCnt[0] = equations[i].split(' ID ')[0]
            initEquation = equations[i].split(' ID ')[1]
            addEquation(equCnt, initEquation)
            equCnt[0]++ 
        }
    }

	var divButtons = document.getElementById('buttons');
	var labelNames = getLabelNames(graph, labelNames)

	panelStudent(graph, labelNames)
	
	nodeName(graph, labelNames, divButtons)

	makeEquation(graph, divButtons, equCnt)

	setSubmit(graph)
};
