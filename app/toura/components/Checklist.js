dojo.provide('toura.components.Checklist');

dojo.require('mulberry._Component');

dojo.require('dojo.store.Memory');
dojo.require('mulberry.app.DeviceStorage');
dojo.require('toura.Data');

dojo.declare('toura.components.Checklist', mulberry._Component, {
  templateString : dojo.cache('toura.components', 'Checklist/Checklist.haml'),
  handleClicks: true,

  prepareData : function() {
    this.ds = mulberry.app.DeviceStorage;
    this.datalist = this.node.children || [];
    var tmplist = this.ds.get('Checklist');
    var list = [];
    for (var i = 0; i < this.datalist.length; i++) {
      if ( ! tmplist ) {
        this.datalist[i].checked = 'unchecked';
      } else {
        // make sure list is up to date with previous checks
        var founditem = dojo.filter(tmplist || [], function(titem) {
          return this.datalist[i].id + '' == titem.id + '';
        }, this);
        if ( founditem.length > 0 ) {
          this.datalist[i].checked = founditem[0].checked;
        } else {
          this.datalist[i].checked = 'unchecked';
        }
      }
    }
    var cleanlist = [];
    // we only want to save the itemid and checked state in the data store
    dojo.forEach(this.datalist, function(item) {
      var cleanitem = new Object;
      cleanitem.id = item.id;
      cleanitem.checked = item.checked;
      cleanlist.push(cleanitem);
    });
    this.store = new dojo.store.Memory({ data : cleanlist});
    this._save();

  },

  setupConnections : function() {
    this.connect(this.domNode, 'click', '_handleClick');
  },

  _handleClick : function(e) {
    var target = e.target;
    while ( target !== this.domNode && target.parentNode !== this.domNode ) {
      if ( target.nodeName.toLowerCase() == 'a' ) { return; }
      target = target.parentNode;
    }

    if ( target.nodeName.toLowerCase() !== 'li' ) { return; }
    if ( dojo.hasClass( target, 'checked' ) ) {
      dojo.addClass( target, 'unchecked' );
      dojo.removeClass( target, 'checked' );
      this._updateAndSave(dojo.attr(target,'itemid'),'unchecked');
    } else if ( dojo.hasClass( target, 'unchecked' ) ) {
      dojo.addClass( target, 'checked' );
      dojo.removeClass( target, 'unchecked' );
      this._updateAndSave(dojo.attr(target,'itemid'),'checked');
    }
  },

  _save : function() {
    this.ds.set('Checklist', this.store.data);
  },

  _updateAndSave : function(itemid, checked) {
    var item = this.store.get(itemid);
    item.checked = checked;
    this.store.put(item);
    this._save();
  }
});
