import { faker } from '@faker-js/faker';


describe('Users Module', () => {
  it('TC01 - Create User Valid', () => {

    const userData = {
      name: faker.person.fullName(),
      gender: faker.person.sex(),
      email: faker.internet.email(),
      status: faker.helpers.arrayElement(['active', 'inactive']),
    }
    cy.request({
      method: 'POST',
      url: '/users',
      headers: {
        Authorization: `Bearer ${Cypress.env('apiToken')}`,
      },
      body: userData
    }).then((response) => {
      expect(response.status).to.eq(201);
      expect(response.body).to.include({
        name: userData.name,
        gender: userData.gender,
        email: userData.email,
        status: userData.status
      })
    });
  });

  it('TC02 - Create User Missing Fields', () => {
    cy.request({
      method: 'POST',
      url: '/users',
      headers: {
        Authorization: `Bearer ${Cypress.env('apiToken')}`,
      },
      body: {},
      failOnStatusCode: false,
    })
      .then((response) => {
        expect(response.status).to.eq(422);
        expect(response.body).to.deep.include.members([
          { field: 'email', message: "can't be blank" },
          { field: 'name', message: "can't be blank" },
          { field: 'gender', message: "can't be blank, can be male of female" },
          { field: 'status', message: "can't be blank" },
        ]);
      });
  });


  it('TC03 - Get All Users', () => {
    cy.request({
      method: 'GET',
      url: '/users',
      headers: {
        Authorization: `Bearer ${Cypress.env('apiToken')}`,
      },
    }).then((response) => {
      expect(response.status).to.eq(200);

      expect(response.body).to.be.an('array');

      expect(response.body.length).to.be.greaterThan(0);

      response.body.forEach((user: any) => {
        expect(user).to.have.property('id');
        expect(user).to.have.property('name');
        expect(user).to.have.property('email');
        expect(user).to.have.property('gender');
        expect(user).to.have.property('status');
      });
    });
  });

  it('TC04 - Get User by Valid ID', () => {
    const UserID = 8009583;

    cy.request({
      method: 'GET',
      url: `/users/${UserID}`,
      headers: {
        Authorization: `Bearer ${Cypress.env('apiToken')}`,
      },
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.be.an('object');
      expect(response.body).to.have.property('id', UserID);
      expect(response.body).to.have.property('name');
      expect(response.body).to.have.property('email');
      expect(response.body).to.have.property('gender');
      expect(response.body).to.have.property('status');
    });
  });

  it('TC05 - Get User by Invalid ID', () => {
    const UserID = 1;

    cy.request({
      method: 'GET',
      url: `/users/${UserID}`,
      headers: {
        Authorization: `Bearer ${Cypress.env('apiToken')}`,
      },
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.eq(404);
      expect(response.body).to.have.property('message', 'Resource not found');
    });
  });

  it('TC06 - Update User - Valid ', () => {
    const initialUser = {
      name: 'Kreetika Bhetuwal',
      gender: 'female',
      email: `kreetika${Date.now()}@gmail.com`,
      status: 'active',
    };

    cy.request({
      method: 'POST',
      url: '/users',
      headers: {
        Authorization: `Bearer ${Cypress.env('apiToken')}`,
      },
      body: initialUser,
    }).then((createResponse) => {
      expect(createResponse.status).to.eq(201);

      const userId = createResponse.body.id;

      const updatedData = {
        name: 'KreetikaUpdated',
      };

      cy.request({
        method: 'PUT',
        url: `/users/${userId}`,
        headers: {
          Authorization: `Bearer ${Cypress.env('apiToken')}`,
        },
        body: updatedData,
      }).then((updateResponse) => {
        expect(updateResponse.status).to.eq(200);
        expect(updateResponse.body).to.have.property('id', userId);
        expect(updateResponse.body.name).to.eq(updatedData.name);
        expect(updateResponse.body.gender).to.eq(initialUser.gender);
        expect(updateResponse.body.status).to.eq(initialUser.status);
      });
    });
  });

  it('TC07 - Delete a user by ID', () => {
    //create user
    const userData = {
      name: 'Delete Test User',
      gender: 'female',
      email: `delete${Date.now()}@gmail.com`,
      status: 'active',
    };

    cy.request({
      method: 'POST',
      url: '/users',
      headers: {
        Authorization: `Bearer ${Cypress.env('apiToken')}`,
      },
      body: userData,
    }).then((createResponse) => {
      expect(createResponse.status).to.eq(201);

      const userId = createResponse.body.id;

      //perform delete
      cy.request({
        method: 'DELETE',
        url: `/users/${userId}`,
        headers: {
          Authorization: `Bearer ${Cypress.env('apiToken')}`,
        },
      }).then((deleteResponse) => {
        expect(deleteResponse.status).to.eq(204);

        //verify deletion
        cy.request({
          method: 'GET',
          url: `/users/${userId}`,
          headers: {
            Authorization: `Bearer ${Cypress.env('apiToken')}`,
          },
          failOnStatusCode: false,
        }).then((getResponse) => {
          expect(getResponse.status).to.eq(404);
          expect(getResponse.body).to.have.property('message', 'Resource not found');
        });
      });
    });
  });

  it('TC08 - Create User - Duplicate Email', () => {
    //create user
    const userData = {
      name: 'Kreetika Bhetuwa;',
      gender: 'female',
      email: `kreetika${Date.now()}@gmail.com`,
      status: 'active',
    };
    cy.request({
      method: 'POST',
      url: '/users',
      headers: {
        Authorization: `Bearer ${Cypress.env('apiToken')}`,
      },
      body: userData,
    }).then((Response) => {
      expect(Response.status).to.eq(201);
    });

    // create another user
    cy.request({
      method: 'POST',
      url: '/users',
      headers: {
        Authorization: `Bearer ${Cypress.env('apiToken')}`,
      },
      body: userData,
      failOnStatusCode: false,
    }).then((Response) => {
      expect(Response.status).to.eq(422);
      expect(Response.body[0]).to.have.property('message', 'has already been taken');
    });
  });


  it('TC09 - Get Users Filter by Gender ', () => {
    const gender = 'female';
    cy.request({
      method: 'GET',
      url: `/users?gender=${gender}`,
      headers: {
        Authorization: `Bearer ${Cypress.env('apiToken')}`,
      },
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.be.an('array');
      expect(response.body.length).to.be.greaterThan(0);
      response.body.forEach((user: any) => {
        expect(user).to.have.property('gender', gender);
      });
    });
  });


  it('TC10 - Get Users Filter by Status ', () => {
    const status = 'active';
    cy.request({
      method: 'GET',
      url: `/users?status=${status}`,
      headers: {
        Authorization: `Bearer ${Cypress.env('apiToken')}`,
      },
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.be.an('array');
      expect(response.body.length).to.be.greaterThan(0);
      response.body.forEach((user: any) => {
        expect(user).to.have.property('status', status);
      });
    });
  });

  it('TC11 - Get Users Invalid Query Parm', () => {
    const status = 'alive';
    cy.request({
      method: 'GET',
      url: `/users?status=${status}`,
      headers: {
        Authorization: `Bearer ${Cypress.env('apiToken')}`,
      },
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body.length).to.eq(0);
    });
  });


  it.only('TC12 - Create User Without Token', () => {
    const userData = {
      name: faker.person.fullName(),
      gender: faker.person.sex(),
      email: faker.internet.email(),
      status: faker.helpers.arrayElement(['active', 'inactive']),
    }
    cy.request({
      method: 'POST',
      url: '/users',
      body: userData,
      failOnStatusCode: false
    }).then((response) => {
      expect(response.status).to.eq(401);
      expect(response.body).to.have.property('message', 'Authentication failed');
    });
  });

})
