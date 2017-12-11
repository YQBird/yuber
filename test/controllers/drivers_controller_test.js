const assert = require('assert');
const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../app');

const Driver = mongoose.model('driver');

describe('Drivers controller', () => {
	it('Post to api/drivers will create a new driver', (done) => {
    Driver.count().then(count => {
    	request(app)
	      .post('/api/drivers')
	      .send({ email: 'test@gmail.com' })
	      .end((err, response) => {
	      	Driver.count().then(newCount => {
	      		assert(count + 1 === newCount);
	      		done();
	      	});
	      });
    });
	});

	it('Put to api/drivers/:id will edit an existing driver', (done) => {
    const driver = new Driver({ email: 'test@gmail.com', driving: false });

    driver.save()
      .then(() => {
      	request(app)
      	  .put(`/api/drivers/${driver._id}`)
      	  .send({ driving: true })
      	  .end((err, response) => {
      	  	Driver.findOne({ email: 'test@gmail.com' })
      	  	  .then((driver) => {
      	  	  	assert(driver.driving === true);
      	  	  	done();
      	  	  });
      	  });
      });
	});

	it('delete to api/drivers/:id will delete an existing driver', (done) => {
		const driver = new Driver({ email: 'test@gmail.com' });

		driver.save()
		  .then(() => {
		  	request(app)
		  	  .delete(`/api/drivers/${driver._id}`)
		  	  .end(() => {
		  	  	Driver.count()
		  	  	  .then((count) => {
                assert(count === 0);
                done();
		  	  	  });
		  	  });
		  });
	});

	it('get to api/drivers will get a list of drivers', (done) => {
    const seattleDriver = new Driver({ 
    	email: 'seattle@gmail.com', 
    	geometry: { type: 'Point', coordinates: [-122.4759902, 47.6147628]}
    }); 

    const miamiDriver = new Driver({ 
    	email: 'miami@gmail.com', 
    	geometry: { type: 'Point', coordinates: [-80.253, 25.791]}
    }); 

    Promise.all([seattleDriver.save(), miamiDriver.save()])
      .then(() => {
      	request(app)
      	  .get('/api/drivers?lng=-80&lat=25')
      	  .end((err, response) => {
      	  	assert(response.body.length === 1);
      	  	assert(response.body[0].obj.email === 'miami@gmail.com');
      	  	done();
      	  })
      })
	});
})