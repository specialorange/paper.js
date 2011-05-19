/*
 * Paper.js
 *
 * This file is part of Paper.js, a JavaScript Vector Graphics Library,
 * based on Scriptographer.org and designed to be largely API compatible.
 * http://paperjs.org/
 * http://scriptographer.org/
 *
 * Distributed under the MIT license. See LICENSE file for details.
 *
 * Copyright (c) 2011, Juerg Lehni & Jonathan Puckey
 * http://lehni.org/ & http://jonathanpuckey.com/
 *
 * All rights reserved.
 */

var Group = this.Group = Item.extend({
	beans: true,

	initialize: function(items) {
		this.base();
		this._children = [];
		this._namedChildren = {};
		this._clipped = false;
		this.setChildren(!items || !Array.isArray(items)
				|| typeof items[0] !== 'object' ? arguments : items);
	},

	clone: function() {
		var copy = this.base();
		copy._clipped = this._clipped;
		return copy;
	},

	/**
	 * Specifies whether the group item is to be clipped.
	 * When setting to true, the first child in the group is automatically
	 * defined as the clipping mask.
	 *
	 * @return true if the group item is to be clipped, false otherwise.
	 */
	isClipped: function() {
		return this._clipped;
	},

	setClipped: function(clipped) {
		this._clipped = clipped;
		var child = this.getFirstChild();
		if (child)
			child.setClipMask(clipped);
	},

	draw: function(ctx, param) {
		for (var i = 0, l = this._children.length; i < l; i++) {
			Item.draw(this._children[i], ctx, param);
			if (this._clipped && i == 0)
				ctx.clip();
		}
	}
});
