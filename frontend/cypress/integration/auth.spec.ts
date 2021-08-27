import { MailhogMessage } from "../types";

// email backend is SMTP server mailhog running in docker container
before(() => {
  cy.exec("docker stop mailhog || true")
    .exec("docker rm mailhog || true")
    .exec(
      "docker run -d -p 1025:1025 -p 8025:8025 --name mailhog mailhog/mailhog"
    );
});
after(() => {
  cy.exec("docker stop mailhog").exec("docker rm mailhog");
});

beforeEach(() => {
  Cypress.Cookies.preserveOnce("session_id");
});

describe(
  "Account Creation, Login, Password Reset",
  {
    failFast: {
      enabled: true,
    },
  },
  () => {
    let username = `user${Date.now()}`;
    let email = `${username}@fake.com`;
    let password = "sdfgsdfg";
    let newPassword = "sdfgsdfg2";
    let confirmationLink: string;
    it("create account", () => {
      // fill form
      cy.visit("/create-account/");
      cy.path().should((path) => expect(path).eq("/create-account/"));
      cy.findByLabelText(/^Username/).type(username);
      cy.findByLabelText(/^Email Address/).type(email);
      cy.findByLabelText(/^Password/).type(password);
      cy.findByLabelText(/^Confirm Password/).type(password);
      cy.findByText("Sign Up").click();

      // test modal
      cy.contains("Confirmation Email Sent");
      cy.findByText(/goto login page/i).click();
      cy.location().should((location) => {
        expect(location.pathname).eq("/login/");
      });
    });

    it("attempt login before confirmation", () => {
      // try login before confirmation
      cy.visit("/login/");
      cy.findByLabelText(/^Email Address/i).type(email);
      // cy.contains(/^Email Address/).type(email, { force: true });
      cy.findByLabelText(/^Password/i).type(password);
      // cy.contains(/Password/).type(password, { force: true });
      cy.findByText((text, elt) => /sign in/i.test(elt!.textContent!), {
        selector: "button",
      }).click();
      cy.findByText(/E-mail is not verified/);
      // cy.location().should((location) => {
      //   expect(location.pathname).eq("/");
      // });
    });

    it("click link in confirmation email", () => {
      // eslint-disable-next-line
      cy.request("http://localhost:8025/api/v1/messages").should(
        (response: { body: MailhogMessage[] }) => {
          let inbox = response.body;
          let lastMessage = inbox[0];
          expect(lastMessage.Raw.To).include(email);
          confirmationLink = (lastMessage as any).Raw.Data.match(
            /https?:\/\/\S+/
          )[0];
          expect(confirmationLink).not.eq(null);
          cy.request(confirmationLink);
          // NOTE 25/08/20 psacawa: cross-origin navigation causes problems
          // cy.visit(confirmationLink)
          //   .location()
          //   .should((location) => {
          //     expect(location.pathname).eq("/login/");
          //   });
        }
      );
    });
    it("login", () => {
      cy.visit("/login/");
      cy.findByLabelText(/Email Address/).type(email);
      cy.findByLabelText(/^Password/).type(password);
      cy.findByText((text, elt) => /sign in/i.test(elt!.textContent!), {
        selector: "button",
      }).click();
      cy.location().should((loc) => {
        expect(loc.pathname).eq("/");
      });
      cy.findAllByText(new RegExp(username));
    });

    it("view profile", () => {
      cy.visit("/profile/").contains(username).contains("Order now");
      // TODO 25/08/20 psacawa: finish this
    });

    it("logout", () => {
      cy.visit("/")
        .findByText(/Logout/)
        .click()
        .path()
        .should("eq", "/")
        .contains(username)
        .should("not.exist");
    });

    it("recover password", () => {
      // form
      cy.visit("/login/")
        .contains("Forgot")
        .click()
        .path()
        .should("equal", "/reset-password/");
      cy.findByLabelText(/^Email Address/).type(email);
      cy.findByText(/send password reset email/i).click();

      // success modal
      cy.findByText(/password reset email sent/i);
      cy.findByText(/continue/i).click();
    });

    // TODO 26/08/20 psacawa: reseolve problems with multiple domains, allauth
    it.skip("click link in confirmation email", () => {
      cy.request("http://localhost:8025/api/v1/messages").should(
        (response: { body: MailhogMessage[] }) => {
          let inbox = response.body;
          let lastMessage = inbox[0];
          expect(lastMessage.Raw.To).include(email);
          confirmationLink = (lastMessage as any).Raw.Data.match(
            /https?:\/\/\S+/
          )[0];
          expect(confirmationLink).not.eq(null);
        }
      );
    });
    it.skip("fill in password reset form", () => {
      cy.visit(confirmationLink)
        .path()
        .should("include", "/auth/password/reset/confirm/");
      cy.findByRole("heading").contains(
        /lexquest password reset confirmation/i
      );
      cy.findByLabelText("Password").type(newPassword);
      cy.findByLabelText("Repeat Password").type(newPassword);
      cy.findByText(/Set new password/).click();

      // TODO 25/08/20 psacawa: check successful and reauth with new pass
    });
  }
);
