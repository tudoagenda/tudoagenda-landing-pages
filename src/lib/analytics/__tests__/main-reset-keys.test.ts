import { pushAgendaBelaMainEvent } from "../dataLayer";

describe("pushAgendaBelaMainEvent: modelo do GTM sem valor velho", () => {
  beforeEach(() => {
    window.dataLayer = [];
    window.sessionStorage.clear();
    history.replaceState(null, "", "/agendabela/automatize-seu-atendimento");
  });

  it("cada push zera os parâmetros dos outros eventos da landing principal", () => {
    pushAgendaBelaMainEvent({
      event: "store_click",
      store: "app_store",
      cta_location: "rodape_selo",
      device_os: "ios",
    });
    pushAgendaBelaMainEvent({ event: "lp_cta_clicked", cta_position: "hero", cta_intent: "primary" });
    pushAgendaBelaMainEvent({ event: "cta_click", cta_location: "automatize_avaliacoes" });

    const [, ctaPush, simPush] = window.dataLayer!;
    for (const k of ["store", "device_os", "cta_location", "form_name", "flow", "source", "alert_kind"]) {
      expect(k in ctaPush).toBe(true);
      expect(ctaPush[k]).toBeUndefined();
    }
    for (const k of ["store", "device_os", "cta_position", "cta_intent"]) {
      expect(k in simPush).toBe(true);
      expect(simPush[k]).toBeUndefined();
    }
    expect(simPush).toEqual(
      expect.objectContaining({
        event: "cta_click",
        cta_location: "automatize_avaliacoes",
        landing_slug: "automatize-seu-atendimento",
        product: "agendabela",
      }),
    );
  });
});
