import { fakePostData, fakeUserData } from '../data/userData';

describe('Comments API Testing', () => {
  const token = Cypress.env('apiToken');
  let userId: number;
  let postId: number;

  before(() => {
    // const userData = fakeUserData();
    return cy.request({
      method: 'POST',
      url: '/users',
      headers: { Authorization: `Bearer ${token}` },
      body: fakeUserData()
    }).then((userResponse) => {
      expect(userResponse.status).to.eq(201);
      userId = userResponse.body.id;

      return cy.request({
        method: 'POST',
        url: '/posts',
        headers: { Authorization: `Bearer ${token}` },
        body: {
          user_id: userId,
          ...fakePostData()
        },
      });
    }).then((postResponse) => {
      expect(postResponse.status).to.eq(201);
      postId = postResponse.body.id;
    });
  });


  it('TC01 - Create Comment with Valid Data', () => {
    const email = `kree${Date.now()}@example.com`;

    cy.request({
      method: 'POST',
      url: '/comments',
      headers: { Authorization: `Bearer ${token}` },
      body: {
        post_id: postId,
        name: 'Kree tika',
        email,
        body: 'This is a comment.',
      },
    }).then((response) => {
      expect(response.status).to.eq(201);
      expect(response.body).to.have.property('id');
      expect(response.body).to.have.property('post_id', postId);
      expect(response.body).to.have.property('name', 'Kree tika');
      expect(response.body).to.have.property('email', email);
      expect(response.body).to.have.property('body', 'This is a comment.');
    });
  });

  it('TC02 - Create Comment with Invalid Email', () => {
    cy.request({
      method: 'POST',
      url: '/comments',
      headers: { Authorization: `Bearer ${token}` },
      body: {
        post_id: postId,
        name: 'Kree tika',
        email: 'invalidemail',
        body: 'This is a comment.',
      },
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.eq(422);
    });
  });

  it('TC03 - Get All Comments', () => {
    cy.request({
      method: 'GET',
      url: '/comments',
      headers: { Authorization: `Bearer ${token}` },
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.be.an('array');

      response.body.forEach((comment: any) => {
        expect(comment).to.have.property('id');
        expect(comment).to.have.property('post_id');
        expect(comment).to.have.property('name');
        expect(comment).to.have.property('email');
        expect(comment).to.have.property('body');
      });
    });
  });

  it('TC04 - Get Comment by Invalid ID', () => {
    cy.request({
      method: 'GET',
      url: '/comments/1',
      headers: { Authorization: `Bearer ${token}` },
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.eq(404);
      expect(response.body).to.have.property('message', 'Resource not found');
    });
  });

  it('TC05 - Get Comment by Valid ID', () => {
    const email = `kree${Date.now()}@example.com`;


    cy.request({
      method: 'POST',
      url: '/comments',
      headers: { Authorization: `Bearer ${token}` },
      body: {
        post_id: postId,
        name: 'Kree tika',
        email,
        body: 'This is a comment.',
      },
    }).then((createResponse) => {
      expect(createResponse.status).to.eq(201);
      const commentID = createResponse.body.id;

      expect(createResponse.body).to.have.property('post_id', postId);
      expect(createResponse.body).to.have.property('name', 'Kree tika');
      expect(createResponse.body).to.have.property('email', email);
      expect(createResponse.body).to.have.property('body', 'This is a comment.');

      cy.request({
        method: 'GET',
        url: `/comments/${commentID}`,
        headers: { Authorization: `Bearer ${token}` },
      }).then((getResponse) => {
        expect(getResponse.status).to.eq(200);
        expect(getResponse.body).to.have.property('id', commentID);
        expect(getResponse.body).to.have.property('post_id', postId);
        expect(getResponse.body).to.have.property('name', 'Kree tika');
        expect(getResponse.body).to.have.property('email', email);
        expect(getResponse.body).to.have.property('body', 'This is a comment.');
      });
    });
  });

  it('TC06 - Create Comment with Missing Required Fields', () => {
    cy.request({
      method: 'POST',
      url: '/comments',
      headers: { Authorization: `Bearer ${token}` },
      body: {
        post_id: postId,
      },
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.eq(422);
    });
  });

  it('TC07 - Create Comment with Invalid Post ID', () => {
    cy.request({
      method: 'POST',
      url: '/comments',
      headers: { Authorization: `Bearer ${token}` },
      body: {
        post_id: 'abc',
        name: 'Test',
        email: 'test@example.com',
        body: 'Hello',
      },
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.eq(422);
    });
  });

  it('TC08 - Create Comment with Very Long Name', () => {
    const longName = 'A'.repeat(256);
    cy.request({
      method: 'POST',
      url: '/comments',
      headers: { Authorization: `Bearer ${token}` },
      body: {
        post_id: postId,
        name: longName,
        email: 'test@example.com',
        body: 'Comment',
      },
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.eq(422);
    });
  });

  it('TC09 - Create Comment with Very Long Body', () => {
    const longBody = 'BC'.repeat(5000);
    cy.request({
      method: 'POST',
      url: '/comments',
      headers: { Authorization: `Bearer ${token}` },
      body: {
        post_id: postId,
        name: 'Test',
        email: 'test@example.com',
        body: longBody,
      },
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.eq(422);
    });
  });

  it('TC10 - Get Comments Filtered by Post ID', () => {
    cy.request({
      method: 'GET',
      url: `/comments/?post_id=${postId}`,
      headers: { Authorization: `Bearer ${token}` },
    }).then((response) => {
      expect(response.status).to.eq(200);
      response.body.forEach((comment: any) => {
        expect(comment).to.have.property('name');
        expect(comment).to.have.property('email');
        expect(comment).to.have.property('body');
      });
    });
  });

  it('TC11 - Update Comment with Valid Data', () => {
    const email = `kree${Date.now()}@example.com`;

    cy.request({
      method: 'POST',
      url: '/comments',
      headers: { Authorization: `Bearer ${token}` },
      body: {
        post_id: postId,
        name: 'Kree tika',
        email,
        body: 'This is a comment for update',
      },
    }).then((response) => {
      expect(response.status).to.eq(201);
      expect(response.body).to.have.property('id');
      expect(response.body).to.have.property('post_id', postId);
      expect(response.body).to.have.property('name', 'Kree tika');
      expect(response.body).to.have.property('email', email);
      expect(response.body).to.have.property('body', 'This is a comment for update');

      const commentID = response.body.id

      cy.request({
        method: 'PUT',
        url: `/comments/${commentID}`,
        headers: { Authorization: `Bearer ${token}` },
        body: {
          body: 'Updated comment text',
        }
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.have.property('id', commentID);
        expect(response.body).to.have.property('post_id', postId);
        expect(response.body).to.have.property('name', 'Kree tika');
        expect(response.body).to.have.property('email', email);
        expect(response.body).to.have.property('body', 'Updated comment text');
      });
    });
  });

  it('TC12 - Update Comment with Invalid Email', () => {
    const email = `kree${Date.now()}@example.com`;

    cy.request({
      method: 'POST',
      url: '/comments',
      headers: { Authorization: `Bearer ${token}` },
      body: {
        post_id: postId,
        name: 'Kree tika',
        email,
        body: 'This is a comment for update',
      },
    }).then((response) => {
      expect(response.status).to.eq(201);
      expect(response.body).to.have.property('id');
      expect(response.body).to.have.property('post_id', postId);
      expect(response.body).to.have.property('name', 'Kree tika');
      expect(response.body).to.have.property('email', email);
      expect(response.body).to.have.property('body', 'This is a comment for update');

      const commentID = response.body.id

      cy.request({
        method: 'PUT',
        url: `/comments/${commentID}`,
        headers: { Authorization: `Bearer ${token}` },
        body: {
          email: 'invalid email',
        },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(422);
      });
    });
  });

  it('TC13 - Delete Comment with Valid ID', () => {
    const email = `kree${Date.now()}@example.com`;

    cy.request({
      method: 'POST',
      url: '/comments',
      headers: { Authorization: `Bearer ${token}` },
      body: {
        post_id: postId,
        name: 'Kree tika',
        email,
        body: 'This is a comment for delete',
      },
    }).then((response) => {
      expect(response.status).to.eq(201);
      expect(response.body).to.have.property('id');
      expect(response.body).to.have.property('post_id', postId);
      expect(response.body).to.have.property('name', 'Kree tika');
      expect(response.body).to.have.property('email', email);
      expect(response.body).to.have.property('body', 'This is a comment for delete');

      const commentID = response.body.id

      cy.request({
        method: 'DELETE',
        url: `/comments/${commentID}`,
        headers: { Authorization: `Bearer ${token}` },
      }).then((response) => {
        expect(response.status).to.eq(204);
      });
    });
  });


  it('TC14 - Delete Comment with Invalid ID', () => {
    const email = `kree${Date.now()}@example.com`;

    cy.request({
      method: 'POST',
      url: '/comments',
      headers: { Authorization: `Bearer ${token}` },
      body: {
        post_id: postId,
        name: 'Kree tika',
        email,
        body: 'This is a comment for delete'
      },
    }).then((response) => {
      expect(response.status).to.eq(201);
      expect(response.body).to.have.property('id');
      expect(response.body).to.have.property('post_id', postId);
      expect(response.body).to.have.property('name', 'Kree tika');
      expect(response.body).to.have.property('email', email);
      expect(response.body).to.have.property('body', 'This is a comment for delete');

      const commentID = response.body.id

      cy.request({
        method: 'DELETE',
        url: `/comments/1`,
        headers: { Authorization: `Bearer ${token}` },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(404);
      });
    });
  });




});
