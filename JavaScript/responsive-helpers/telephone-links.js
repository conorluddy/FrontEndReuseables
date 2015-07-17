
/**
 * telLinksForMobileOnly
 *
 * We needed to only follow tel: links if we're on a mobile device.
 * Otherwise they get a new class and their link gets removed.
 */
function telLinksForMobileOnly() {

  var
  $telLinks = $('[href^=tel], [data-original-href]'),
  linkHref = '',
  modifiedClass = 'js-href-removed',
  setLinkState,
  linksDisabled = false;

  if ($telLinks.length) {
    setLinkState = function() {
      if (APP.device.state !== 'small' && !linksDisabled) {

        APP.log('Disabling telephone links');

        $telLinks.each(function(index, el) {

          linkHref = $(el).attr('href');

          if (linkHref.indexOf('tel:') === 0) {
            $(el)
              .removeAttr('href')
                .attr('data-original-href', linkHref)
                  .addClass(modifiedClass);
          }
        });

        linksDisabled = true;

      //If this is suddenly a small device
      } else if (APP.device.state === 'small' && linksDisabled) {

        APP.log('Enabling telephone links');

        $telLinks.each(function(index, el) {

          linkHref = $(el).attr('data-original-href');

          if (linkHref.indexOf('tel:') === 0) {
            $(el)
              .removeAttr('data-original-href')
                .attr('href', linkHref)
                  .removeClass(modifiedClass);
          }
        });

        linksDisabled = false;

      }

    };

    setLinkState();
    $(window).on('resize', throttle(setLinkState, 200));

  }

}


