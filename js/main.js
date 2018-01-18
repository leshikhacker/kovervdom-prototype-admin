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
  // один из чекбоксов активности всегда выбран
  $('.js-active-checkbox').on('click', function(e) {
    var self = $(this);

    var restore_check = true;
    $('.js-active-checkbox').each(function() {
      if($(this).is(':checked')) {
        restore_check = false;
      }
    });

    if(restore_check) {
      e.preventDefault();
      return false;
    }
  });

  // выделение целого столбца по клику на его название
  $('.js-choose-column').on('click', function() {
    var self = $(this);
    var table = self.closest('table');
    var column_class = '.' + self.data('column-class');

    table.find(column_class).toggleClass('selected');
    self.toggleClass('selected');


    if($('body .js-row.selected').length > 0 && $('.js-choose-column.selected').length > 0) {
      $('.js-show-table-edit').show();
    }
    else {
      $('.js-show-table-edit').hide();
    }
  });

  $('body').on('click', '.js-choose-row', function(){
    var self = $(this);
    self.closest('tr').toggleClass('selected');

    if($('body .js-row.selected').length > 0 && $('.js-choose-column.selected').length > 0) {
      $('.js-show-table-edit').show();
    }
    else {
      $('.js-show-table-edit').hide();
    }
  });

  // попап множественного редактирования свойств
  $('.js-show-table-edit').on('click', function(e) {
    e.preventDefault();
    e.stopPropagation();

    // собиарем данные, которые будут отвечать за генерацию формы добавления
    var data = {
      props: [],
      items: []
    };
    $('body .js-row.selected').each(function() {
      data.items.push($(this).data('item-id'));
    });

    if(data.items.length > 0) {
      $('.js-choose-column.selected').each(function() {
        data.props.push($(this).data('prop-name'));
      });
      console.log(data);
      data = $.param(data);

      // на беке: $.post на php-файл
      $.get('ajax-add-table.html', data, function(res) {
        var html = res;
        $.fancybox.open(html);
      });
    }


  });

  // аякс-пагинация
  $('.js-show-more').on('click', function() {
    fetch('ajax-table-rows.html').then(function(response) {
      return response.text();
     })
    .then(function(html) {
      $('.js-show-table').append(html);
    })
    .catch();
  });

  // свертывание-развертывание групп свойств
  $('body').on('click', '.js-fields-group-rollup', function() {
    var self = $(this);
    var parent_block = self.closest('.js-fields-group');
    parent_block.find('.js-fields-group-title').toggleClass('hidden');
    parent_block.toggleClass('hidden');
  });

  // немного js для кастомного инпут-файла
  $('.js-input-file').on('change', function() {
    var self = $(this);
    var parent = self.closest('.js-input-file-wrap');

    parent.find('.js-input-file-label').text(self.val()).addClass('active');
  });

  // связывание контролов формы - с контролами сброса значений свойств
  // актуально для всяких селектов и чекбоксов
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

  // сброс значений свойств на странице добавления
  $('body').on('click', '.js-properties-selected-reset-button', function() {
    var self = $(this);
    var form_control_id = self.data('id');

    var el = $('body').find('[id="' + form_control_id + '"]');

    var el_type = el.attr('type');
    el_type = el_type ? el_type : el.prop("tagName");

    if(el_type == 'checkbox') {
      el.prop('checked', false).change();
    }
    else if(el_type == 'SELECT') {
      el.val('').change();
    }
  });

  // для демо, нужен для бека свой обработчик
  $('body').on('click', '.js-popup-save', function(e) {
    e.preventDefault();
    e.stopPropagation();

    $.fancybox.close();
  });
});
