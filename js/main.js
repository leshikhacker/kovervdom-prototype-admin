var FormPropertiesController = function() {
  this.$parentWrapper = $('.js-properties-selected');

  this.handleElements = function(elements, type) {
    var values = [];
    elements.each(function() {
      var is_checkbox = (type == 'checkbox');
      var is_select = (type == 'SELECT');
      var _self = $(this);
      if(is_checkbox) {
        if(_self.is(":checked")) {
          var _id = _self.attr('id');
          var label = $('[for="' + _id + '"]');
          var text = label.data('label');
          text = text ? text : label.text();
        }
      }
      else if(is_select) {
        if(_self.val()) {
          var _id = _self.attr('id');
          var option = _self.find('option:selected');
          var text = option.text();
        }
      }

      if(_id && text) {
        values.push({
          id: _id,
          text: text.toLowerCase()
        })
      }

    });
    return values;
  };

  this.buildSwitcher = function(control_name, data) {
    var container = $('body').find('[id="for_' + control_name + '"]');
    var container_buttons = container.find('.js-properties-selected-reset-button');

    // вспомогательные переменные для цикла
    var existing_item;
    var button_template;

    container_buttons.hide();
    if(data.length > 0) {
      container.removeClass('hidden');
    }
    else {
      container.addClass('hidden');
    }

    for(var i in data) {
      existing_item = container.find('[data-id="' + data[i]['id'] + '"]');
      if(existing_item.length) {
        existing_item.text(data[i]['text']).show();
      }
      else {
        button_template = this.getOffButtonTemplate(data[i]['id'], data[i]['text']);
        container.append(button_template);
      }
    }

    if(container.find('.js-properties-selected-reset-button').is(':visible')) {
      container.show();
    }
  };

  this.getOffButtonTemplate = function(id, name) {
    return '<button type="button" data-id="' + id + '" class="properties-selected-button js-properties-selected-reset-button">' + name + '</button>';
  };
};
var formPropertiesController = new FormPropertiesController();

$(document).ready(function() {
  $('.js-choose-row').on('click', function(){
    $(this).closest('tr').toggleClass('selected');
  });

  $('.js-choose-column').on('click', function() {
    console.log('js-choose-column click');
    var self = $(this);
    var table = self.closest('table');
    var column_class = '.' + self.data('column-class');

    table.find(column_class).toggleClass('selected');
  });

  $('.js-fields-group-rollup').on('click', function() {
    var self = $(this);
    var parent_block = self.closest('.js-fields-group');
    parent_block.find('.js-fields-group-title').toggleClass('hidden');
    parent_block.toggleClass('hidden');
  });
  $('.js-input-file').on('change', function() {
    var self = $(this);
    var parent = self.closest('.js-input-file-wrap');

    parent.find('.js-input-file-label').text(self.val()).addClass('active');
  });

  $(".js-input-binded").on('change', function() {
    var self = $(this);
    var attr_name = self.attr('name');
    var attr_type = self.attr('type');
    attr_type = attr_type ? attr_type : self.prop("tagName");

    // для группы чекбоксов, к примеру
    var relative_elements = $('[name="' + attr_name + '"]');

    // структура, куда складываем значения контролов формы
    self_values = formPropertiesController.handleElements(relative_elements, attr_type);
    formPropertiesController.buildSwitcher(attr_name, self_values);
  });

  $('body').on('click', '.js-properties-selected-reset-button', function() {
    var self = $(this);
    var form_control_id = self.data('id');

    var el = $('body').find('[id="' + form_control_id + '"]');

    var el_type = el.attr('type');
    el_type = el_type ? el_type : el.prop("tagName");

    console.log(el_type);

    if(el_type == 'checkbox') {
      el.prop('checked', false).change();
    }
    else if(el_type == 'SELECT') {
      el.val('').change();
    }
  });
});
