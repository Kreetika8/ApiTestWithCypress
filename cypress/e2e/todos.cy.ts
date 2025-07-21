import { fakePostData, fakeUserData } from '../data/userData'; 


describe('API Testing for ToDos', () => {

  const token = Cypress.env('apiToken');
  let userId: number;

  before(() => {
    cy.request({
      method: 'POST',
      url: '/users',
      headers: { Authorization: `Bearer ${token}` },
      body: fakeUserData()
    }).then((res) => {
      expect(res.status).to.eq(201);
      userId = res.body.id;
    });
  });



  it('TC01 - Create Valid Todo', () => {
    cy.request({
      method: 'POST',
      url: '/todos',
      headers: { Authorization: `Bearer ${token}` },
      body: {
        user_id: userId,
        title: 'New Todo',
        status: 'pending',
      },
    }).then((res) => {
      expect(res.status).to.eq(201);
      expect(res.body).to.have.property('id');
      expect(res.body.user_id).to.eq(userId);
      expect(res.body.title).to.eq('New Todo');
      expect(res.body.status).to.eq('pending');
    });
  });

  it('TC02 - Create Todo with Missing Fields', () => {
    cy.request({
      method: 'POST',
      url: '/todos',
      headers: { Authorization: `Bearer ${token}` },
      body: {
        user_id: userId,
        title: '',
        status: '',
      },
      failOnStatusCode: false
    }).then((res) => {
      expect(res.status).to.eq(422);
    });
  });

  it('TC03 - Create Todo with Invalid Status', () => {
    cy.request({
      method: 'POST',
      url: '/todos',
      headers: { Authorization: `Bearer ${token}` },
      body: {
        user_id: userId,
        title: 'Invalid Status Todo',
        status: 'Invalid',
      },
      failOnStatusCode: false
    }).then((res) => {
      expect(res.status).to.eq(422);
    });
  });

  it('TC04 -Get All Todos', () => {
    cy.request({
      method: 'GET',
      url: '/todos',
      headers: { Authorization: `Bearer ${token}` },
      failOnStatusCode: false
    }).then((res) => {
      expect(res.status).to.eq(200);

      res.body.forEach((Todos: any) => {
        expect(Todos.user_id).to.be.a('number');
        expect(Todos.title).to.be.a('string');
        expect(Todos.status).to.be.a('string');
      })
    });
  });

  it('TC05 - Get Todo by Valid ID', () => {
    cy.request({
      method: 'POST',
      url: '/todos',
      headers: { Authorization: `Bearer ${token}` },
      body: {
        user_id: userId,
        title: 'New Todo for GET ToDo by id',
        status: 'pending',
      },
    }).then((res) => {
      expect(res.status).to.eq(201);
      expect(res.body).to.have.property('id');
      expect(res.body.user_id).to.eq(userId);
      expect(res.body.title).to.eq('New Todo for GET ToDo by id');
      expect(res.body.status).to.eq('pending');

      const todo_id = res.body.id;

      cy.request({
        method: 'GET',
        url: `/todos/${todo_id}`,
        headers: { Authorization: `Bearer ${token}` },
      }).then((res) => {
        expect(res.status).to.eq(200);
        expect(res.body).to.have.property('id', todo_id);
        expect(res.body).to.have.property('title', 'New Todo for GET ToDo by id');
        expect(res.body).to.have.property('status', 'pending');
      });
    });
  });


  it('TC06 - Get Todo by Invalid ID', () => {
    cy.request({
      method: 'GET',
      url: '/todos/1',
      headers: { Authorization: `Bearer ${token}` },
      failOnStatusCode: false
    }).then((res) => {
      expect(res.status).to.eq(404);
    });
  });


  it('TC07- Update Todo with Valid Data', () => {
    cy.request({
      method: 'POST',
      url: '/todos/',
      headers: { Authorization: `Bearer ${token}` },
      body: {
        user_id: userId,
        title: 'New Todo for PUT ToDo by id',
        status: 'pending'
      }
    }).then((res) => {
      expect(res.status).to.eq(201);
      expect(res.body).to.have.property('id');
      expect(res.body).to.have.property('title', 'New Todo for PUT ToDo by id');
      expect(res.body).to.have.property('status', 'pending');

      const todo_ID = res.body.id;

      cy.request({
        method: 'PUT',
        url: `/todos/${todo_ID}`,
        headers: { Authorization: `Bearer ${token}` },
        body: {
          user_id: userId,
          title: 'ToDo after put',
          status: 'completed'
        }
      }).then((res) => {
        expect(res.status).to.eq(200);
        expect(res.body).to.have.property('id', todo_ID);
        expect(res.body).to.have.property('title', 'ToDo after put');
        expect(res.body).to.have.property('status', 'completed');
      });
    });
  });

  it('TC08- Update Todo with Invalid ID', () => {
    cy.request({
      method: 'PUT',
      url: '/todos/1',
      headers: { Authorization: `Bearer ${token}` },
      body: {
        "title": "Updated Todo",
        "status": "completed"
      },
      failOnStatusCode: false
    }).then((res) => {
      expect(res.status).to.eq(404);
      expect(res.body).to.have.property('message', 'Resource not found');
    });
  })


  it('TC09- Delete Todo with Valid Data', () => {
    cy.request({
      method: 'POST',
      url: '/todos/',
      headers: { Authorization: `Bearer ${token}` },
      body: {
        user_id: userId,
        title: 'New Todo for DELETE',
        status: 'pending'
      }
    }).then((res) => {
      expect(res.status).to.eq(201);
      expect(res.body).to.have.property('id');
      expect(res.body).to.have.property('title', 'New Todo for DELETE');
      expect(res.body).to.have.property('status', 'pending');

      const todo_ID = res.body.id;

      cy.request({
        method: 'DELETE',
        url: `/todos/${todo_ID}`,
        headers: { Authorization: `Bearer ${token}` },
      }).then((res) => {
        expect(res.status).to.eq(204);
        expect(res.body).to.eq('');
      });
    });
  });


  it('TC10- Delete Todo with Invalid Data', () => {
    cy.request({
      method: 'DELETE',
      url: '/todos/1',
      headers: { Authorization: `Bearer ${token}` },
      failOnStatusCode: false
    }).then((res) => {
      expect(res.status).to.eq(404);
      expect(res.body).to.have.property('message', 'Resource not found');
    });
  })



})
