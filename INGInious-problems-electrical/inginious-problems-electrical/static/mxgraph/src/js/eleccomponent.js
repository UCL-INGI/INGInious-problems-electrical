function VoltageShape() {};
		VoltageShape.prototype = new mxCylinder();
		VoltageShape.prototype.constructor = VoltageShape;
		VoltageShape.prototype.redrawPath = function(path, x, y, w, h, isForeground)
		{
			var dx = w / 6;
            var dy = h / 6;
			if (isForeground)
			{
				if(w <= h)
				{
					path.moveTo(0, h/2);
					path.curveTo(0 , h/2 + 0.55*w/2, w/2 - 0.55*w/2, h/2 + w/2  ,w/2, h/2 + w/2);
					path.curveTo(w/2 + 0.55*w/2, h/2 + w/2, w , h/2 + 0.55*w/2, w, h/2);
					path.curveTo(w, h/2 - 0.55*w/2, w/2 + 0.55*w/2, h/2 - w/2, w/2, h/2 - w/2);
					path.curveTo(w/2 - 0.55*w/2, h/2 - w/2, 0, h/2 - 0.55*w/2, 0, h/2);
					
					path.moveTo(w/2, h/2 - w/8);
					path.lineTo(w/2, h/2 - 3*w/8);
					path.moveTo(3*w/8, h/2 - w/4);
					path.lineTo(5*w/8, h/2 - w/4);

					path.moveTo(3*w/8, h/2 + w/4);
					path.lineTo(5*w/8, h/2 + w/4);
				}
				else
				{
					path.moveTo(w/2, 0);
					path.curveTo( w/2 + 0.55*h/2, 0, w/2 + h/2 , h/2 - 0.55*h/2,  w/2 + h/2, h/2);
					path.curveTo(w/2 + h/2, h/2 + 0.55*h/2, w/2 + 0.55*h/2 , h, w/2, h);
					path.curveTo(w/2 - 0.55*h/2, h, w/2 - h/2, h/2 + 0.55*h/2, w/2 - h/2, h/2);
					path.curveTo(w/2 - h/2, h/2 - 0.55*h/2, w/2 - 0.55*h/2, 0, w/2, 0);

					path.moveTo(w/2 - h/8, h/4);
					path.lineTo(w/2 + h/8, h/4);
					path.moveTo(w/2, h/8);
					path.lineTo(w/2, 3*h/8);

					path.moveTo(w/2 - h/8, 3*h/4 );
					path.lineTo(w/2 + h/8, 3*h/4);	
				}
			}
		};
		mxCellRenderer.registerShape('voltage', VoltageShape);

function InductorShapeH() { };
		InductorShapeH.prototype = new mxCylinder();
		InductorShapeH.prototype.constructor = InductorShapeH;
		InductorShapeH.prototype.redrawPath = function(path, x, y, w, h, isForeground)
		{
			var dx = w / 6;
            var dy = h / 6;
			if (isForeground)
			{
				path.moveTo(0, h/2);
				path.lineTo(dx, h/2);
				path.lineTo(dx, h/2-dy);
				path.curveTo(dx, h/2-dy, 1.5*dx, h/2-5*dy, 2*dx, h/2-dy);
				path.curveTo(2*dx, h/2-dy, 2.5*dx, h/2-5*dy, 3*dx, h/2-dy);
				path.curveTo(3*dx, h/2-dy, 3.5*dx, h/2-5*dy, 4*dx, h/2-dy);
				path.curveTo(4*dx, h/2-dy, 4.5*dx, h/2-5*dy, 5*dx, h/2-dy);
				path.lineTo(5*dx, h/2);
				path.lineTo(w, h/2);
				path.end();
			}
		};
		mxCellRenderer.registerShape('inductor horizontal', InductorShapeH);

function InductorShapeV() { };
		InductorShapeV.prototype = new mxCylinder();
		InductorShapeV.prototype.constructor = InductorShapeV;
		InductorShapeV.prototype.redrawPath = function(path, x, y, w, h, isForeground)
		{
			var dx = w / 6;
            var dy = h / 6;
			if (isForeground)
			{
				path.moveTo(w/2, 0);
				path.lineTo(w/2, dy);
				path.lineTo(w/2-dx ,dy);
				path.curveTo(w/2-dx ,dy, w/2-5*dx, 1.5*dy, w/2-dx, 2*dy);
                path.curveTo(w/2-dx, 2*dy, w/2-5*dx, 2.5*dy, w/2-dx, 3*dy);
				path.curveTo(w/2-dx, 3*dy, w/2-5*dx, 3.5*dy, w/2-dx, 4*dy);
				path.curveTo(w/2-dx, 4*dy, w/2-5*dx, 4.5*dy, w/2-dx, 5*dy);
				path.lineTo(w/2, 5*dy);
				path.lineTo(w/2, h);
				path.end();
			}
		};
		mxCellRenderer.registerShape('inductor vertical', InductorShapeV);

function CapacitorShapeH() { };
		CapacitorShapeH.prototype = new mxCylinder();
		CapacitorShapeH.prototype.constructor = CapacitorShapeH;
		CapacitorShapeH.prototype.redrawPath = function(path, x, y, w, h, isForeground)
		{
			var dx = w / 16;
			if (isForeground)
			{
				path.moveTo(0, h/2);
				path.lineTo(w/2-dx, h/2);
				path.moveTo(w/2+dx, 0);
				path.lineTo(w/2+dx, h);
				path.moveTo(w/2-dx, 0);
				path.lineTo(w/2-dx, h);
				path.moveTo(w/2+dx, h/2);
				path.lineTo(w, h/2);
				path.end();
			}
		};
		mxCellRenderer.registerShape('capacitor horizontal', CapacitorShapeH);

function CapacitorShapeV() { };
		CapacitorShapeV.prototype = new mxCylinder();
		CapacitorShapeV.prototype.constructor = CapacitorShapeV;
		CapacitorShapeV.prototype.redrawPath = function(path, x, y, w, h, isForeground)
		{
			var dy = h / 16;
			if (isForeground)
			{
				path.moveTo(w/2, 0);
				path.lineTo(w/2, h/2-dy);
				path.moveTo(0, h/2+dy);
				path.lineTo(w, h/2+dy);
				path.moveTo(0, h/2-dy);
				path.lineTo(w, h/2-dy);
				path.moveTo(w/2, h/2+dy);
				path.lineTo(w/2, h);
				path.end();
			}
		};
		mxCellRenderer.registerShape('capacitor vertical', CapacitorShapeV);

function ResistorShapeH() { };      
        
		ResistorShapeH.prototype = new mxCylinder();
		ResistorShapeH.prototype.constructor = ResistorShapeH;
		ResistorShapeH.prototype.redrawPath = function(path, x, y, w, h, isForeground)
		{
			var dx = w / 16;
			if (isForeground)
			{
                path.fillAndStroke();
				path.moveTo(0, h / 2);
				path.lineTo(2 * dx, h / 2);
				path.lineTo(3 * dx, 0);
				path.lineTo(5 * dx, h);
				path.lineTo(7 * dx, 0);
				path.lineTo(9 * dx, h);
				path.lineTo(11 * dx, 0);
				path.lineTo(13 * dx, h);
				path.lineTo(14 * dx, h / 2);
				path.lineTo(16 * dx, h / 2);
				path.end();
                path.stroke();
			}
		};
		mxCellRenderer.registerShape('resistor horizontal', ResistorShapeH);

function ResistorShapeV() { };      
        
		ResistorShapeV.prototype = new mxCylinder();
		ResistorShapeV.prototype.constructor = ResistorShapeV;
		ResistorShapeV.prototype.redrawPath = function(path, x, y, w, h, isForeground)
		{
			var dy = h / 16;
			if (isForeground)
			{
				path.moveTo(w/2, 0);
				path.lineTo(w/2, 2 * dy);
				path.lineTo(0, 3 * dy);
				path.lineTo(w, 5 * dy);
				path.lineTo(0 ,7 * dy);
				path.lineTo(w, 9 * dy);
				path.lineTo(0 ,11 * dy);
				path.lineTo(w ,13 * dy);
				path.lineTo(w/2, 14 * dy);
				path.lineTo(w/2, 16 * dy);
				path.end();
			}
		};
		mxCellRenderer.registerShape('resistor vertical', ResistorShapeV);
