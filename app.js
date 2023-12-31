const express = require('express')
const path = require('path')

const {open} = require('sqlite')
const sqlite3 = require('sqlite3')

const app = express()
app.use(express.json())
const dbPath = path.join(__dirname, 'covid19India.db')

let db = null
const initiallizeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log(
        'Server Running at https://yogichaitanyapncjfnjscpaqlbe.drops.nxtwave.tech:3000/',
      )
    })
  } catch (e) {
    console.log(`DB ERROR: ${e.message}`)
    process.exit(1)
  }
}

initiallizeDBAndServer()

// API 1
app.get('/states/', async (request, response) => {
  const getListOfAllStates = `SELECT * FROM state;`
  const statesArray = await db.all(getListOfAllStates)

  const convertDBObjectToResponseObject = dbObject => {
    return {
      stateId: dbObject.state_id,
      stateName: dbObject.state_name,
      population: dbObject.population,
    }
  }

  response.send(
    statesArray.map(state => convertDBObjectToResponseObject(state)),
  )
})

// API 2
app.get('/states/:stateId/', async (request, response) => {
  const {stateId} = request.params
  const getSelectedByState = `SELECT * FROM state WHERE state_id=${stateId};`
  const findState = await db.get(getSelectedByState)
  const convertDBObjectToResponseObject = dbObject => {
    return {
      stateId: dbObject.state_id,
      stateName: dbObject.state_name,
      population: dbObject.population,
    }
  }
  const result = convertDBObjectToResponseObject(findState)
  response.send(result)
})

// API 3
app.post('/districts/', async (request, response) => {
  const districtDetails = request.body
  const {districtName, stateId, cases, cured, active, deaths} = districtDetails
  const addDistrictQuery = `INSERT INTO district(district_name,state_id,cases,cured,active,deaths) VALUES('${districtName}','${stateId}','${cases}','${cured}','${active}','${deaths}');`
  await db.run(addDistrictQuery)
  response.send('District Successfully Added')
})

// API 4
app.get('/districts/:districtId/', async (request, response) => {
  const {districtId} = request.params
  const getRequireDistrict = `SELECT * FROM district WHERE district_id='${districtId}';`
  const findDistrict = await db.get(getRequireDistrict)
  const convertDBObjectToResponseObject = dbObject => {
    return {
      districtId: dbObject.district_id,
      districtName: dbObject.district_name,
      stateId: dbObject.state_id,
      cases: dbObject.cases,
      cured: dbObject.cured,
      active: dbObject.active,
      deaths: dbObject.deaths,
    }
  }

  const result = convertDBObjectToResponseObject(findDistrict)
  response.send(result)
})

//API 5
app.delete('/districts/:districtId/', async (request, response) => {
  const {districtId} = request.params
  const deleteDistrict = `DELETE FROM district WHERE district_id=${districtId};`
  await db.run(deleteDistrict)
  response.send('District Removed')
})

// API 6
app.put('/districts/:districtId/', async (request, response) => {
  const {districtId} = request.params
  const districtDetails = request.body
  const {districtName, stateId, cases, cured, active, deaths} = districtDetails
  const updateDistrictQuery = `UPDATE district SET district_name='${districtName}',state_id='${stateId}',cases='${cases}',cured='${cured}',active='${active}',deaths='${deaths}' WHERE district_id='${districtId}';`
  await db.run(updateDistrictQuery)
  response.send('District Details Updated')
})

// API 7
app.get('/states/:stateId/stats/', async (request, response) => {
  const {stateId} = request.params
  const getSelectedByStateId = `SELECT * FROM state WHERE state_id=${stateId};`
  const stateWiseFullDetails = await db.get(getSelectedByStateId)

  const convertDBObjectToResponseObject = dbObject => {
    return {
      totalCases: dbObject.cases,
      totalCured: dbObject.cured,
      totalActive: dbObject.active,
      totalDeaths: dbObject.deaths,
    }
  }

  const result = convertDBObjectToResponseObject(stateWiseFullDetails)
  response.send(result)
})

// API 8
app.get('/districts/:districtId/details/', async (request, response) => {
  const {districtId} = request.params
  const getDetailsByDistrictId = `SELECT state_name FROM district WHERE district_id=${districtId};`
  const findStateName = await db.get(getDetailsByDistrictId)

  const convertDBObjectToResponseObject = dbObject => {
    return {
      stateName: dbObject.state_name,
    }
  }

  const result = convertDBObjectToResponseObject(findStateName)
  response.send(result)
})

module.exports = app
