/*
 * Paper.js
 *
 * This file is part of Paper.js, a JavaScript Vector Graphics Library,
 * based on Scriptographer.org and designed to be largely API compatible.
 * http://paperjs.org/
 * http://scriptographer.org/
 *
 * Copyright (c) 2011, Juerg Lehni & Jonathan Puckey
 * http://lehni.org/ & http://jonathanpuckey.com/
 *
 * Distributed under the MIT license. See LICENSE file for details.
 *
 * All rights reserved.
 */

var Numerical = new function() {

	// Lookup tables for abscissas and weights with values for n = 2 .. 16.
	// As values are symetric, only store half of them and addapt algorithm
	// to factor in symetry.
	var abscissas = [
		[  0.5773502691896257645091488],
		[0,0.7745966692414833770358531],
		[  0.3399810435848562648026658,0.8611363115940525752239465],
		[0,0.5384693101056830910363144,0.9061798459386639927976269],
		[  0.2386191860831969086305017,0.6612093864662645136613996,0.9324695142031520278123016],
		[0,0.4058451513773971669066064,0.7415311855993944398638648,0.9491079123427585245261897],
		[  0.1834346424956498049394761,0.5255324099163289858177390,0.7966664774136267395915539,0.9602898564975362316835609],
		[0,0.3242534234038089290385380,0.6133714327005903973087020,0.8360311073266357942994298,0.9681602395076260898355762],
		[  0.1488743389816312108848260,0.4333953941292471907992659,0.6794095682990244062343274,0.8650633666889845107320967,0.9739065285171717200779640],
		[0,0.2695431559523449723315320,0.5190961292068118159257257,0.7301520055740493240934163,0.8870625997680952990751578,0.9782286581460569928039380],
		[  0.1252334085114689154724414,0.3678314989981801937526915,0.5873179542866174472967024,0.7699026741943046870368938,0.9041172563704748566784659,0.9815606342467192506905491],
		[0,0.2304583159551347940655281,0.4484927510364468528779129,0.6423493394403402206439846,0.8015780907333099127942065,0.9175983992229779652065478,0.9841830547185881494728294],
		[  0.1080549487073436620662447,0.3191123689278897604356718,0.5152486363581540919652907,0.6872929048116854701480198,0.8272013150697649931897947,0.9284348836635735173363911,0.9862838086968123388415973],
		[0,0.2011940939974345223006283,0.3941513470775633698972074,0.5709721726085388475372267,0.7244177313601700474161861,0.8482065834104272162006483,0.9372733924007059043077589,0.9879925180204854284895657],
		[  0.0950125098376374401853193,0.2816035507792589132304605,0.4580167776572273863424194,0.6178762444026437484466718,0.7554044083550030338951012,0.8656312023878317438804679,0.9445750230732325760779884,0.9894009349916499325961542]
	];

	var weights = [
		[1],
		[0.8888888888888888888888889,0.5555555555555555555555556],
		[0.6521451548625461426269361,0.3478548451374538573730639],
		[0.5688888888888888888888889,0.4786286704993664680412915,0.2369268850561890875142640],
		[0.4679139345726910473898703,0.3607615730481386075698335,0.1713244923791703450402961],
		[0.4179591836734693877551020,0.3818300505051189449503698,0.2797053914892766679014678,0.1294849661688696932706114],
		[0.3626837833783619829651504,0.3137066458778872873379622,0.2223810344533744705443560,0.1012285362903762591525314],
		[0.3302393550012597631645251,0.3123470770400028400686304,0.2606106964029354623187429,0.1806481606948574040584720,0.0812743883615744119718922],
		[0.2955242247147528701738930,0.2692667193099963550912269,0.2190863625159820439955349,0.1494513491505805931457763,0.0666713443086881375935688],
		[0.2729250867779006307144835,0.2628045445102466621806889,0.2331937645919904799185237,0.1862902109277342514260976,0.1255803694649046246346943,0.0556685671161736664827537],
		[0.2491470458134027850005624,0.2334925365383548087608499,0.2031674267230659217490645,0.1600783285433462263346525,0.1069393259953184309602547,0.0471753363865118271946160],
		[0.2325515532308739101945895,0.2262831802628972384120902,0.2078160475368885023125232,0.1781459807619457382800467,0.1388735102197872384636018,0.0921214998377284479144218,0.0404840047653158795200216],
		[0.2152638534631577901958764,0.2051984637212956039659241,0.1855383974779378137417166,0.1572031671581935345696019,0.1215185706879031846894148,0.0801580871597602098056333,0.0351194603317518630318329],
		[0.2025782419255612728806202,0.1984314853271115764561183,0.1861610000155622110268006,0.1662692058169939335532009,0.1395706779261543144478048,0.1071592204671719350118695,0.0703660474881081247092674,0.0307532419961172683546284],
		[0.1894506104550684962853967,0.1826034150449235888667637,0.1691565193950025381893121,0.1495959888165767320815017,0.1246289712555338720524763,0.0951585116824927848099251,0.0622535239386478928628438,0.0271524594117540948517806]
	];

	// Math short-cuts for often used methods and values
	var abs = Math.abs,
		sqrt = Math.sqrt,
		pow = Math.pow,
		cos = Math.cos,
		PI = Math.PI;

	// Define the missing Math.cbrt()
	function cbrt(x) {
		return x > 0 ? pow(x, 1 / 3) : x < 0 ? -pow(-x, 1 / 3) : 0;
	}

	return {
		TOLERANCE: 10e-6,
		// Precision when comparing against 0
		// TODO: Find a good value
		EPSILON: 10e-12,

		/**
		 * Check if the value is 0, within a tolerance defined by
		 * Numerical.EPSILON.
		 */
		isZero: function(val) {
			return Math.abs(val) <= this.EPSILON;
		},

		/**
		 * Gauss-Legendre Numerical Integration.
		 */
		integrate: function(f, a, b, n) {
			var x = abscissas[n - 2],
				w = weights[n - 2],
				A = 0.5 * (b - a),
				B = A + a,
				i = 0,
				m = (n + 1) >> 1,
				sum = n & 1 ? w[i++] * f(B) : 0; // Handle odd n
			while (i < m) {
				var Ax = A * x[i];
				sum += w[i++] * (f(B + Ax) + f(B - Ax));
			}
			return A * sum;
		},

		/**
		 * Root finding using Newton-Raphson Method combined with Bisection.
		 */
		findRoot: function(f, df, x, a, b, n, tolerance) {
			for (var i = 0; i < n; i++) {
				var fx = f(x),
					dx = fx / df(x);
				// See if we can trust the Newton-Raphson result. If not we use
				// bisection to find another candiate for Newton's method.
				if (abs(dx) < tolerance)
					return x;
				// Generate a candidate for Newton's method.
				var nx = x - dx;
				// Update the root-bounding interval and test for containment of
				// the candidate. If candidate is outside the root-bounding
				// interval, use bisection instead.
				// There is no need to compare to lower / upper because the
				// tangent line has positive slope, guaranteeing that the x-axis
				// intercept is larger than lower / smaller than upper.
				if (fx > 0) {
					b = x;
					x = nx <= a ? 0.5 * (a + b) : nx;
				} else {
					a = x;
					x = nx >= b ? 0.5 * (a + b) : nx;
				}
			}
		},

		/**
		 * Solves the quadratic polynomial with coefficients a, b, c for roots
		 * (zero crossings) and and returns the solutions in an array.
		 *
		 * a*x^2 + b*x + c = 0
		 */
		solveQuadratic: function(a, b, c, roots, tolerance) {
			// Code ported over and adapted from Uintah library (MIT license).
			// If problem is actually linear, return 0 or 1 easy roots
			if (abs(a) < tolerance) {
				if (abs(b) >= tolerance) {
					roots[0] = -c / b;
					return 1;
				}
				// If all the coefficients are 0, we have infinite solutions!
				return abs(c) < tolerance ? -1 : 0; // Infinite or 0 solutions
			}
			var q = b * b - 4 * a * c;
			if (q < 0)
				return 0; // 0 solutions
			q = sqrt(q);
			a *= 2; // Prepare division by (2 * a)
			var n = 0;
			roots[n++] = (-b - q) / a;
			if (q > 0)
				roots[n++] = (-b + q) / a;
			return n; // 1 or 2 solutions
		},

		/**
		 * Solves the cubic polynomial with coefficients a, b, c, d for roots
		 * (zero crossings) and and returns the solutions in an array.
		 *
		 * a*x^3 + b*x^2 + c*x + d = 0
		 */
		solveCubic: function(a, b, c, d, roots, tolerance) {
			// Code ported over and adapted from Uintah library (MIT license).
			if (abs(a) < tolerance)
				return Numerical.solveQuadratic(b, c, d, roots, tolerance);
			// Normalize to form: x^3 + b x^2 + c x + d = 0:
			b /= a;
			c /= a;
			d /= a;
			// Compute discriminants
			var bb = b * b,
				p = 1 / 3 * (-1 / 3 * bb + c),
				q = 1 / 2 * (2 / 27 * b * bb - 1 / 3 * b * c + d),
				// Use Cardano's formula
				ppp = p * p * p,
				D = q * q + ppp;
			// Substitute x = y - b/3 to eliminate quadric term: x^3 +px + q = 0
			b /= 3;
			if (abs(D) < tolerance) {
			    if (abs(q) < tolerance) { // One triple solution.
			        roots[0] = - b;
			        return 1;
			    } else { // One single and one double solution.
			        var u = cbrt(-q);
			        roots[0] = 2 * u - b;
			        roots[1] = - u - b;
			        return 2;
			    }
			} else if (D < 0) { // Casus irreducibilis: three real solutions
			    var phi = 1 / 3 * Math.acos(-q / sqrt(-ppp));
			    var t = 2 * sqrt(-p);
			    roots[0] =   t * cos(phi) - b;
			    roots[1] = - t * cos(phi + PI / 3) - b;
			    roots[2] = - t * cos(phi - PI / 3) - b;
			    return 3;
			} else { // One real solution
			    D = sqrt(D);
			    roots[0] = cbrt(D - q) - cbrt(D + q) - b;
			    return 1;
			}
		}
	};
};
