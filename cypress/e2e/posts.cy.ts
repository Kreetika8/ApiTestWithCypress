import { fakePostData, fakeUserData } from '../data/userData';


describe('API Test on Post', () => {
  const token = Cypress.env('apiToken');
  let userId: number;
  let postId: number;

  before(() => {
    cy.request({
      method: 'POST',
      url: '/users',
      headers: { Authorization: `Bearer ${token}` },
      body: fakeUserData()
    }).then((userResponse) => {
      expect(userResponse.status).to.eq(201);
      userId = userResponse.body.id;
    });
  });


  it('TC01 - Create Post with Valid Data', () => {
    cy.request({
      method: 'POST',
      url: '/posts',
      headers: { Authorization: `Bearer ${token}` },
      body: {
        user_id: userId,
        ...fakePostData()
      },
    }).then((postResponse) => {
      expect(postResponse.status).to.eq(201);
      expect(postResponse.body.user_id).to.eq(userId);
    });
  })

  it('TC02- Create Post with Missing Fields', () => {
    cy.request({
      method: 'POST',
      url: '/posts',
      headers: { Authorization: `Bearer ${token}` },
      body: {
        user_id: userId,
        title: '',
        body: '',
      },
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.eq(422);
    });
  });

  it('TC03- Get all posts', () => {
    cy.request({
      method: 'GET',
      url: '/posts',
      headers: { Authorization: `Bearer ${token}` },
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.be.an('array');
      response.body.forEach((post: any, index: number) => {
        expect(post).to.have.property('id').and.to.be.a('number');
        expect(post).to.have.property('user_id').and.to.be.a('number');
        expect(post).to.have.property('title').and.to.be.a('string');
        expect(post).to.have.property('body').and.to.be.a('string');
      });
    });
  });

  it('TC04 - GET Post with Valid ID', () => {
    const postPayload = fakePostData()
    cy.request({
      method: 'POST',
      url: '/posts',
      headers: { Authorization: `Bearer ${token}` },
      body: {
        user_id: userId,
        ...postPayload
      },
    }).then((postResponse) => {
      expect(postResponse.status).to.eq(201);
      postId = postResponse.body.id;

      cy.request({
        method: 'GET',
        url: `/posts/${postId}`,
        headers: { Authorization: `Bearer ${token}` },
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.have.property('id', postId);
        expect(response.body).to.have.property('user_id', userId);
        expect(response.body).to.have.property('title', postPayload.title);
        expect(response.body).to.have.property('body', postPayload.body);
      });
    });
  });

  it('TC05 - GET  Post with InValid ID', () => {
    cy.request({
      method: 'GET',
      url: `/posts/1`,
      headers: { Authorization: `Bearer ${token}` },
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.eq(404);
      expect(response.body).to.have.property('message', 'Resource not found');
    });
  });

  it('TC06 - Update Post with Valid ID', () => {
    cy.request({
      method: 'POST',
      url: '/posts',
      headers: { Authorization: `Bearer ${token}` },
      body: {
        user_id: userId,
        ...fakePostData()
      },
    }).then((postResponse) => {
      expect(postResponse.status).to.eq(201);
      const postId = postResponse.body.id;

      cy.request({
        method: 'PUT',
        url: `/posts/${postId}`,
        headers: { Authorization: `Bearer ${token}` },
        body: {
          user_id: userId,
          title: 'Updated Title',
          body: 'Updated Content',
        },
      }).then((updateResponse) => {
        expect(updateResponse.status).to.eq(200);
        expect(updateResponse.body).to.have.property('id', postId);
        expect(updateResponse.body).to.have.property('user_id', userId);
        expect(updateResponse.body).to.have.property('title', 'Updated Title');
        expect(updateResponse.body).to.have.property('body', 'Updated Content');
      });
    });
  });

  it('TC07 - Update Post with InValid ID', () => {
    cy.request({
      method: 'PUT',
      url: `/posts/1`,
      headers: { Authorization: `Bearer ${token}` },
      body: {
        user_id: userId,
        ...fakePostData()
      },
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.eq(404);
    });
  });

  it('TC08 - Delete Post with Valid ID', () => {
    cy.request({
      method: 'POST',
      url: '/posts',
      headers: { Authorization: `Bearer ${token}` },
      body: {
        user_id: userId,
        ...fakePostData()
      },
    }).then((postResponse) => {
      expect(postResponse.status).to.eq(201);
      const postId = postResponse.body.id;

      cy.request({
        method: 'DELETE',
        url: `/posts/${postId}`,
        headers: { Authorization: `Bearer ${token}` },
      }).then((delResponse) => {
        expect(delResponse.status).to.eq(204);

        cy.request({
          method: 'GET',
          url: `/posts/${postId}`,
          headers: { Authorization: `Bearer ${token}` },
          failOnStatusCode: false,
        }).then((getResponse) => {
          expect(getResponse.status).to.eq(404);
          expect(getResponse.body).to.have.property('message', 'Resource not found');
        });
      });
    });
  });

  it('TC09 - Delete Post with InValid ID', () => {
    cy.request({
      method: 'DELETE',
      url: `/posts/1`,
      headers: { Authorization: `Bearer ${token}` },
      failOnStatusCode: false
    }).then((delResponse) => {
      expect(delResponse.status).to.eq(404);
    });
  });

  it('TC10 - Create Post with Extra Field', () => {
    const basePost = fakePostData()
    cy.request({
      method: 'POST',
      url: '/posts',
      headers: { Authorization: `Bearer ${token}` },
      body: {
        user_id: userId,
        ...basePost,
        role: 'Admin'
      },
    }).then((postResponse) => {
      expect(postResponse.status).to.eq(201);
      expect(postResponse.body.user_id).to.eq(userId);
      expect(postResponse.body).to.have.property('title', basePost.title);
      expect(postResponse.body).to.have.property('body', basePost.body);
    });
  })

})
