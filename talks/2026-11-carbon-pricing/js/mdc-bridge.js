/* Bridge: the ManyDesignsCarbon figure modules (js/figures/mdc/, registered on MDC.figures)
   run inside this deck's PSD driver. Their chrome colours are remapped to the metropolis
   palette; the paper's categorical colours (intervention and outcome categories,
   self/peer beliefs) stay as in the published figures. */
(function () {
  Object.assign(MDC.palette, {
    green: '#23373B', green2: '#4A6266', greenDeep: '#1A2A2D', greenLight: '#7E979B',
    amber: '#EB811B', amberSoft: '#F5AF63',
    ink: '#23373B', ink2: '#39494d', muted: '#70807f',
    line: '#DCE0E0', line2: '#C4CBCB', bg: '#FAFAFA', bg2: '#EEF0F0', card: '#FFFFFF'
  });
  Object.keys(MDC.figures).forEach(function (id) {
    PSD.figures['mdc-' + id] = function (mount, opts) {
      MDC.qaStatic = !!PSD.qaStatic;
      return MDC.figures[id](mount, Object.assign({}, opts, { palette: MDC.palette }));
    };
  });
})();
