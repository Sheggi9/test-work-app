$(document).ready(function() {
  function setActivePage(pageNumber) {
    const fields = $(':radio.global-filter').serializeArray();
    const textSearch = $(':text').serializeArray();
    const filter1 = fields[0]['value'];
    const filter2 = fields[1]['value'];
    const filter3 = textSearch[0]['value'];
    const searchText = '&title=' + filter3;
    let page = '';
    $('#change-status').text('Save change');

    new Promise(resolve => {
      if (
        pageNumber === undefined &&
        filter1 === 'all' &&
        filter2 === 'all-projects' &&
        filter3 === ''
      ) {
        const numPage = 'https://devsharp.siisltd.ru/test/api/projects?page=1';
        resolve(numPage);
        getAllItemsServer(numPage);
      } else {
        if (pageNumber === undefined) {
          page = 'https://devsharp.siisltd.ru/test/api/projects?page=1';
        } else {
          page =
            'https://devsharp.siisltd.ru/test/api/projects?page=' + pageNumber;
        }
        if (filter1 === 'all' && filter2 === 'all-projects' && filter3 === '') {
          resolve(page);
        } else if (
          filter1 === 'all' &&
          filter2 !== 'all-projects' &&
          filter3 === ''
        ) {
          resolve(page + filter2);
        } else if (
          filter1 === 'all' &&
          filter2 !== 'all-projects' &&
          filter3 !== ''
        ) {
          resolve(page + searchText + filter2);
        } else if (
          filter1 !== 'all' &&
          filter2 === 'all-projects' &&
          filter3 === ''
        ) {
          resolve(page + filter1);
        } else if (
          filter1 !== 'all' &&
          filter2 === 'all-projects' &&
          filter3 !== ''
        ) {
          resolve(page + searchText + filter1);
        } else if (
          filter1 !== 'all' &&
          filter2 !== 'all-projects' &&
          filter3 === ''
        ) {
          resolve(page + filter1 + filter2);
        } else if (
          filter1 !== 'all' &&
          filter2 !== 'all-projects' &&
          filter3 !== ''
        ) {
          resolve(page + searchText + filter1 + filter2);
        } else if (
          filter1 === 'all' &&
          filter2 === 'all-projects' &&
          filter3 !== ''
        ) {
          resolve(page + searchText);
        }
      }
    })
      .then(res => {
        getInfo(res);
      })
      .then(res => {
        return res;
      })
      .catch(err => {
        console.log(err);
      });
  }

  function getInfo(numPage) {
    $.ajax({
      type: 'GET',
      url: numPage,
      headers: {
        Accept: ' text/plain',
      },
      success: function(data) {
        creatItemList(data);
        constructorPagination(data);
        setCounterItems(data, numPage);
      },
    });
  }

  function getAllItemsServer(numPage) {
    $.ajax({
      type: 'GET',
      url: numPage,
      headers: {
        Accept: ' text/plain',
      },
      success: function(data) {
        setCounterAllItems(data, numPage);
      },
    });
  }

  function creatItemList(data) {
    const items = data.projects;
    const parentForElements = $('#items-list');
    new Promise(function(resolve, reject) {
      if (parentForElements.find('*').length >= items.length) {
        resolve(parentForElements.remove());
      } else {
        reject(creatСhildrenDomElement(items, parentForElements));
      }
    })
      .then(() => {
        $('<tbody>', {
          id: 'items-list',
        }).appendTo($('.items-list-wrapper'));
      })
      .then(() => {
        const parentForElements = $('#items-list');
        creatСhildrenDomElement(items, parentForElements);
      })
      .catch(err => {
        console.log(err);
      });
  }

  function creatСhildrenDomElement(items, parentForElements) {
    for (let i = 0; i < items.length; i++) {
      const idElement = items[i].id;

      const addClass =
        items[i].status === 0
          ? 'draft'
          : items[i].status === 1
          ? 'active'
          : items[i].status === 2
          ? 'finished'
          : items[i].status === 3
          ? 'archive'
          : items[i].status === 4
          ? 'cancelled'
          : '';

      $('<tr>', {
        'data-index': idElement,
        class: 'items-list__element ' + addClass,
        append: [
          $('<td>', {
            text: items[i].title,
            class: 'items-list__element-title items-list__hide-show',
            on: {
              click: function() {
                showHideInfo($(this));
              },
            },
          }),
          $('<td>', {
            class:
              'items-list__element-info items-list__hide-show items-list__element-text-wrapper',
            append: [
              $('<tr>', {
                text: 'Title: ' + items[i].title,
                class:
                  'items-list__element-text items-list__element-text_title-mobile',
              }),
              $('<div>', {
                class: 'items-list__element-info_mob',
                append: [
                  $('<tr>', {
                    text: 'City: ' + items[i].city,
                    class:
                      'items-list__element-text items-list__element-text_city',
                  }),
                  $('<tr>', {
                    text: 'Total interviews: ' + items[i].totalInterviews,
                    class:
                      'items-list__element-text items-list__element-text_total-interviews',
                  }),
                  $('<tr>', {
                    text: 'Success interviews: ' + items[i].successInterviews,
                    class:
                      'items-list__element-text items-list__element-text_success-interviews',
                  }),
                  $('<tr>', {
                    text:
                      'Date: ' +
                      items[i].creationDate.replace(new RegExp(/[TZ]/gi), ' '),
                    class:
                      'items-list__element-text items-list__element-text_creation-date',
                  }),
                ],
              }),
            ],
          }),
          $('<td>', {
            class: 'form-set-status',
            append: [
              $('<tr>', {
                text: 'Set status',
              }),
              $('<form>', {
                class: 'form-set-status_items',
                append: [
                  $('<div>', {
                    class: 'form-set-status_item-wrapper',
                    append: [
                      $('<input>', {
                        disabled:
                          (addClass !== 'cancelled' &&
                            addClass !== 'draft' &&
                            addClass !== 'active') ||
                          addClass !== 'draft',
                        value: 'draft',
                        type: 'radio',
                        name: 'setStatus',
                        class: 'input-set-status',
                        // id: 'set-draft',
                        checked: addClass === 'draft',
                        on: {
                          click: function() {
                            infoStatusItem($(this), this.value);
                          },
                        },
                      }),
                      $('<label>', {
                        for: 'set-draft',
                        text: 'Draft',
                      }),
                    ],
                  }),
                  $('<div>', {
                    class: 'form-set-status_item-wrapper',
                    append: [
                      $('<input>', {
                        disabled:
                          (addClass !== 'finished' &&
                            addClass !== 'cancelled' &&
                            addClass !== 'draft' &&
                            addClass !== 'active') ||
                          (addClass !== 'active' && addClass !== 'draft'),
                        value: 'active',
                        type: 'radio',
                        name: 'setStatus',
                        class: 'input-set-status',
                        // id: 'set-active',
                        checked: addClass === 'active',
                        on: {
                          click: function() {
                            infoStatusItem($(this), this.value);
                          },
                        },
                      }),
                      $('<label>', {
                        for: 'set-active',
                        text: 'Active',
                      }),
                    ],
                  }),
                  $('<div>', {
                    class: 'form-set-status_item-wrapper',
                    append: [
                      $('<input>', {
                        disabled:
                          (addClass !== 'finished' &&
                            addClass !== 'archive' &&
                            addClass !== 'active') ||
                          (addClass !== 'finished' && addClass !== 'active'),
                        value: 'finished',
                        type: 'radio',
                        name: 'setStatus',
                        class: 'input-set-status',
                        // id: 'set-finished',
                        checked: addClass === 'finished',
                        on: {
                          click: function() {
                            infoStatusItem($(this), this.value);
                          },
                        },
                      }),
                      $('<label>', {
                        for: 'set-finished',
                        text: 'Finished',
                      }),
                    ],
                  }),
                  $('<div>', {
                    class: 'form-set-status_item-wrapper',
                    append: [
                      $('<input>', {
                        disabled:
                          addClass !== 'finished' && addClass !== 'archive',
                        value: 'archive',
                        type: 'radio',
                        name: 'setStatus',
                        class: 'input-set-status',
                        // id: 'set-archive',
                        checked: addClass === 'archive',
                        on: {
                          click: function() {
                            infoStatusItem($(this), this.value);
                          },
                        },
                      }),
                      $('<label>', {
                        for: 'set-archive',
                        text: 'Archive',
                      }),
                    ],
                  }),
                  $('<div>', {
                    class: 'form-set-status_item-wrapper',
                    append: [
                      $('<input>', {
                        disabled:
                          addClass !== 'draft' &&
                          addClass !== 'active' &&
                          addClass !== 'cancelled',
                        value: 'cancelled',
                        type: 'radio',
                        name: 'setStatus',
                        class: 'input-set-status',
                        // id: 'set-cancelled',
                        checked: addClass === 'cancelled',
                        on: {
                          click: function() {
                            infoStatusItem($(this), this.value);
                          },
                        },
                      }),
                      $('<label>', {
                        for: 'set-cancelled',
                        text: 'Cancelled',
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),
        ],
      }).appendTo(parentForElements);
    }
  }

  function constructorPagination(data) {
    const items = parseInt(data.totalPages);
    const parentDomEl = $('#pagination-list');
    const currentPage = data.currentPage;

    if (parentDomEl.find('li').length === 0) {
      createPagination(items, currentPage, parentDomEl);
    } else {
      new Promise(resolve => {
        resolve(removePagination(parentDomEl));
      })
        .then(() => {
          const parentParentDomEl = $('.pagination-list-wrapper');
          $('<ul>', {
            id: 'pagination-list',
            class: 'pagination',
          }).appendTo(parentParentDomEl);
        })
        .then(() => {
          const newParentDomEl = $('#pagination-list');
          createPagination(items, currentPage, newParentDomEl);
        });
    }
  }

  function removePagination(parentDomEl) {
    parentDomEl.remove();
  }

  let filterPaginationPage = '';

  function createPagination(items, currentPage, parentDomEl) {
    $('#change-status').prop('disabled', true);
    filterPaginationPage = items;
    $('.search-page-number_value').attr('placeholder', 'Total pages: ' + items);
    const newItems = [];
    if (currentPage === 0 || currentPage === 1 || currentPage === 2) {
      newItems.push(1, 2, 3);
    } else if (currentPage === items) {
      newItems.push(items - 2, items - 1, items);
    } else {
      newItems.push(currentPage - 1, currentPage, currentPage + 1);
    }
    for (let i = 0; i < newItems.length; i++) {
      let className = '';
      const pageNumber = newItems[i];
      const href = pageNumber;
      if (currentPage === newItems[i]) {
        className = 'pagination-list__element  page-item ' + 'active';
      } else {
        className = 'pagination-list__element page-item';
      }
      $('<li>', {
        class: className,
        'data-index': newItems[i],
        append: $('<a>', {
          text: pageNumber,
          href: href,
          class: 'pagination-list__element-text page-link',
          on: {
            click: function(event) {
              event.preventDefault();
              setActivePage($(this).attr('href'));
            },
          },
        }),
      }).appendTo(parentDomEl);
    }
  }

  function setFilter() {
    const parentDomEl = $('#pagination-list');
    const page = parentDomEl
      .find('li.active')
      .find('a')
      .attr('href');
    setActivePage(page);
  }

  function setCounterItems(data, numPage) {
    let itemsWithoutLastPage = data.projects.length * (data.totalPages - 1);
    if (data.totalPages === data.currentPage) {
      itemsWithoutLastPage =
        (itemsWithoutLastPage / data.projects.length) * itemsInFirstPage;
    }
    const lastPage = numPage.replace(
      /(page=)[0-9]*/gi,
      'page=' + data.totalPages
    );

    function getShowItems(callback) {
      $.ajax({
        type: 'GET',
        url: lastPage,
        headers: {
          Accept: ' text/plain',
        },
        success: callback,
      });
    }

    getShowItems(function(data) {
      const showItems = itemsWithoutLastPage + data.projects.length;
      setShowItems(showItems);
    });
  }

  function setShowItems(items) {
    if (isNaN(items)) {
      items = '0';
      $('.error-message').css('display', 'flex');
      $('.wrapper-all').css('height', '100vh');
      $('.table-responsive-sm').css('height', '0');
    } else {
      $('.error-message').css('display', 'none');
      $('.table-responsive-sm').css('height', '100%');
    }
    $('.element-cnt_show').text(items);
  }

  let itemsInFirstPage = '';

  function setCounterAllItems(data, numPage) {
    const itemsWithoutLastPage = data.projects.length * (data.totalPages - 1);
    const lastPage = numPage.replace(
      /(page=)[0-9]*/gi,
      'page=' + data.totalPages
    );

    function getShowAllItems(callback) {
      $.ajax({
        type: 'GET',
        url: lastPage,
        headers: {
          Accept: ' text/plain',
        },
        success: callback,
      });
    }

    getShowAllItems(function(data) {
      const showItems = itemsWithoutLastPage + data.projects.length;
      itemsInFirstPage = data.projects.length;
      setShowAllItems(showItems);
    });
  }

  function setShowAllItems(items) {
    $('.element-cnt_all').text(items);
  }

  $('#search-field').keypress(function(e) {
    if (e.key === 'Enter') {
      e.preventDefault();
    }
  });
  $('#search-field').on('input', function(event) {
    const parentDomEl = $('#pagination-list');
    const page = parentDomEl
      .find('li.active')
      .find('a')
      .attr('href');
    setActivePage(page);
  });

  $('#items-list__element').on('click', function() {
    const parentDomEl = $('#pagination-list');
    const page = parentDomEl
      .find('li.active')
      .find('a')
      .attr('href');
    setActivePage(page);
  });

  function infoStatusItem(data, value) {
    const parentClass = $(data)
      .parents('.items-list__element')
      .attr('class');
    const parentEl = $(data).parents('.items-list__element');
    const currentValue = new RegExp('(' + value + ')');
    const searchResult = currentValue.test(parentClass);
    if (!searchResult) {
      parentEl.addClass('changed');
      parentEl.find('.save-change').prop('disabled', false);
    } else {
      parentEl.removeClass('changed');
      parentEl.find('.save-change').prop('disabled', true);
    }
    const changeItems = $('.items-list__element.changed');
    const actionButton = $('#change-status');
    if (changeItems.length > 1) {
      actionButton.prop('disabled', false);
      actionButton.text('Save all change ');
    } else if (changeItems.length === 1) {
      actionButton.prop('disabled', false);
      actionButton.text('Save change');
    } else {
      actionButton.prop('disabled', true);
    }
  }

  $(':radio').click(setFilter);

  $('#change-status').click(function(event) {
    event.preventDefault();
    const popupStyleActive = {
      opacity: '1',
      visibility: 'visible',
    };
    $('#popup1').css(popupStyleActive);
  });

  $('#change-status-close').click(function() {
    const popupStyleActive = {
      opacity: '0',
      visibility: 'hidden',
    };
    $('#change-status').prop('disabled', false);
    $('#popup1').css(popupStyleActive);
  });
  $('#change-status-send').click(function() {
    const popupStyleActive = {
      opacity: '0',
      visibility: 'hidden',
    };
    $('#popup1').css(popupStyleActive);
    $('#change-status').prop('disabled', true);
    $('#change-status').text('Save change');
    const fields = $('.items-list__element.changed');
    $.each(fields, function(i, value) {
      const idChangedElement = $(value).attr('data-index');
      const newStatus = $(value)
        .find('.input-set-status:checked')
        .val();
      const newStatusNumber =
        newStatus === 'draft'
          ? '0'
          : newStatus === 'active'
          ? '1'
          : newStatus === 'finished'
          ? '2'
          : newStatus === 'archive'
          ? '3'
          : newStatus === 'cancelled'
          ? '4'
          : '';
      const requestURL =
        'https://devsharp.siisltd.ru/test/api/projects/setProjectStatus?projectId=' +
        idChangedElement +
        '&status=' +
        newStatusNumber;
      $.post(requestURL, function(data) {
        // $( '.result' ).html( data );
      });
    });
    let currentPagination = parseInt(
      $('.pagination-list__element.page-item.active').attr('data-index')
    );
    currentPagination += 1;
    setActivePage(currentPagination);
  });

  $('.search-page-number').click(function() {
    const pageNumber = $('.search-page-number_value').val();
    if (pageNumber < 1) {
      setActivePage(1);
      $('.search-page-number_value').val('1');
    } else if (pageNumber >= 1 && pageNumber <= filterPaginationPage) {
      setActivePage(pageNumber);
      $('.search-page-number_value').val(pageNumber);
    } else if (pageNumber > filterPaginationPage) {
      setActivePage(filterPaginationPage);
      $('.search-page-number_value').val(filterPaginationPage);
    } else {
      $('.search-page-number_value').val('1');
    }
  });

  $('#show-hide-filter-button').click(function() {
    const filterBlock = $('.sticky-sticky_filter');
    const counterBlock = $('.sticky-item_counter');
    if (filterBlock.is(':visible')) {
      setTimeout(() => {
        counterBlock.hide(800);
      }, 700);
      filterBlock.hide(800);
      $(this).text('Show menu');
    } else {
      setTimeout(() => {
        filterBlock.show(800);
      }, 800);
      counterBlock.show(750);
      $(this).text('Hide menu');
    }
  });

  $(document).on('click', '.items-list__hide-show', function() {
    const filterBlock = $(this).find('.items-list__element-info_mob');
    if (filterBlock.is(':visible')) {
      filterBlock.toggleClass('show-hide');
    } else {
      filterBlock.toggleClass('show-hide');
    }
  });

  function showHideInfo(el) {
    const filterBlock = el
      .closest('.items-list__element')
      .find('.items-list__element-info_mob');
    if (filterBlock.is(':visible')) {
      filterBlock.toggleClass('show-hide');
    } else {
      filterBlock.toggleClass('show-hide');
    }
  }

  setActivePage();
});
