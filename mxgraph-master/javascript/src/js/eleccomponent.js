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

function InductorShape() { };
		InductorShape.prototype = new mxCylinder();
		InductorShape.prototype.constructor = InductorShape;
		InductorShape.prototype.redrawPath = function(path, x, y, w, h, isForeground)
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
		mxCellRenderer.registerShape('inductor', InductorShape);

function CapacitorShape() { };
		CapacitorShape.prototype = new mxCylinder();
		CapacitorShape.prototype.constructor = CapacitorShape;
		CapacitorShape.prototype.redrawPath = function(path, x, y, w, h, isForeground)
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
		mxCellRenderer.registerShape('capacitor', CapacitorShape);

function ResistorShape() { };
		ResistorShape.prototype = new mxCylinder();
		ResistorShape.prototype.constructor = ResistorShape;
		ResistorShape.prototype.redrawPath = function(path, x, y, w, h, isForeground)
		{
			var dx = w / 16;
			if (isForeground)
			{
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
			}
		};
		mxCellRenderer.registerShape('resistor', ResistorShape);