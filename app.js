const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const fs = require("fs");
const courses = require("./myCourses");
//to post you must use bodyParser
app.use(bodyParser.json());
app.use(express.static("assets"));

app.get("/", (req, res) => {
  res.end(fs.readFileSync("./instruction.html"));
});

app.get("/courses", (req, res) => {
  res.json({ success: true, data: courses });
});

app.get("/courses/:id", (req, res) => {
  const acourse = courses.courses.find((item) => { return item.courseId == req.params.id})
  const response = { success: true, data: acourse }
  if (acourse != null) {
    res.status(200).json(response)
  }
  else {
    res.status(404).json({ success: false, data: null })
  }
});

const save = () => {
  let gpax = courses.courses.map(item => {
    return {
      gpa: Number(item.gpa) * Number(item.credit),
      credit: Number(item.credit)
    }
  })
    .reduce((sum, item) => {
      return {
        gpa: item.gpa + sum.gpa,
        credit: item.credit + sum.credit
      }
    }, { gpa: 0, credit: 0 })
  courses.gpax = (gpax.gpa / gpax.credit).toFixed(2)
  let db = JSON.stringify(courses, null, 2)
  fs.writeFileSync('myCourses.json', db)
}

app.delete("/courses/:id", (req, res) => {
  let size = courses.courses.length
  courses.courses = courses.courses.filter((item) => {return item.courseId != req.params.id})
  if (courses.courses.length < size) {
    save()
    res.status(200).json({ success: true, data: courses.courses })
  }
  else {
    res.status(404).json({ success: false, data: courses.courses })
  }
})

app.post("/addCourse", (req, res) => {
  const { courseId, courseName, credit, gpa } = req.body
  const newC = {
    courseId: courseId,
    courseName: courseName,
    credit: credit,
    gpa: gpa
  }
  if (courseId !== undefined && courseName !== undefined &&
    credit !== undefined && gpa !== undefined) {
    courses.courses.push(newC)
    save()
    res.status(201).send({ success: true, data: newC })
  }
  else {
    res.status(422).send({ success: false, error: "ใส่ข้อมูลไม่ครบ" })
  }
})

//follow instruction in http://localhost:8000/

const port = process.env.PORT || 8000;
app.listen(port, () => console.log(`server started on port:${port}`));
