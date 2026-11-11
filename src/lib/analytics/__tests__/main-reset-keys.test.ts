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

  it("parâmetros do cadastro sem cartão não grudam no evento seguinte", () => {
    pushAgendaBelaMainEvent({ event: "signup_path_chosen", signup_path: "cartao", signup_step: "escolha" });
    pushAgendaBelaMainEvent({ event: "checkout_returned", checkout_result: "desistiu" });
    pushAgendaBelaMainEvent({ event: "lp_signup_completed" });
    const [, ret, done] = window.dataLayer!;
    expect("signup_path" in ret && ret.signup_path === undefined).toBe(true);
    expect("signup_step" in ret && ret.signup_step === undefined).toBe(true);
    for (const k of ["signup_step", "signup_path", "checkout_result", "failure_reason"]) {
      expect(k in done).toBe(true);
      expect(done[k]).toBeUndefined();
    }
  });
});

