const reviewModel = require("../models/reviewmodel")
const bookModel = require("../models/bookmodel")
const userModel = require("../models/usermodel")
const { isValid } = require("../validator/validator")
const { default: mongoose } = require("mongoose")

const CreateReview = async function (req, res) {

    try {

        let bookid = req.params.bookId
        
        if (!mongoose.Types.ObjectId.isValid(bookid)) {
            return res.status(400).send({ status: false, msg: "This is invalid bookId" })
        }

        let bookId = await bookModel.findOne({ _id: bookid, isDeleted: false })

        if (!bookId) {
            return res.status(404).send({ status: false, msg: "This bookId does not exit , Its already deleted" })
        }
        if (Object.keys(req.body).length == 0) {
            return res.status(400).send({ status: false, msg: "please send Rewiew for book" })
        }

        let { reviewedBy, rating, review } = req.body

        if (!isValid(reviewedBy)) {
            return res.status(400).send({ status: false, msg: "Please provide reviewedBy its required and must be in correct format" })
        }
        if (typeof rating !== "number") {
            return res.status(400).send({ status: false, msg: "Please provide rating its required and must be in correct format" })
        }
        if(!/^[1-5]$/.test(rating)){
            return res.status(400).send({status : false , msg : "rating Must be Integer"})
        }
        // if (rating < 1 || rating > 5) {
        //     return res.status(400).send({ status: false, msg: "rating should be min 1 and max 5" })
        // }
        if (!isValid(review)) {
            return res.status(400).send({ status: false, msg: " Please provide review its required and must be in correct format" })
        }

        const saveData = { bookId: bookid, reviewedBy, reviewedAt: new Date(), rating, review }

        let UpdatereviewInBook = await bookModel.findOneAndUpdate({ _id: bookid }, { $inc: { reviews: 1 } },{new : true}).select({__v : 0}).lean()
        let rewiewData = await reviewModel.create(saveData)


       // let bookRewiewData = JSON.parse(JSON.stringify(UpdatereviewInBook))

       UpdatereviewInBook["rewiewData"] = {_id:rewiewData ._id,bookId: bookid,reviewedBy: rewiewData.reviewedBy,reviewedAt: rewiewData.reviewedAt,rating: rewiewData.rating,review: rewiewData.review}


        return res.status(201).send({ status: true, message: "Success", data: UpdatereviewInBook })

    } catch (error) {
        res.status(500).send({ status: false, msg: error.message })
    }
}


const updateReview = async function (req, res) {

    try {

        const bookId = req.params.bookId;
        const reviewId = req.params.reviewId;
        
        if (!mongoose.Types.ObjectId.isValid(bookId)) return res.status(400).send({ status: false, message: "invalid BookId" })

        const requiredBook = await bookModel.findOne({ _id: bookId, isDeleted: false }).select({__v : 0}).lean()
        if (!requiredBook) return res.status(404).send({ status: false, message: "No Such book present" })

        if (!mongoose.Types.ObjectId.isValid(reviewId)) return res.status(400).send({ status: false, message: "invalid reviewId" })
        const requiredReview = await reviewModel.findOne({ _id: reviewId, bookId: bookId, isDeleted: false })

        if (!requiredReview) return res.status(404).send({status: false, message: "No any review of the book"})

        if(Object.keys(req.body).length == 0) return res.status(400).send({status : false , msg : "No review Update , please provide review upadate detail"})

        let { reviewedBy, rating, review } = req.body
        let obj = {reviewedAt : new Date()}
        
        if(reviewedBy){

        if (!isValid(reviewedBy)) {
            return res.status(400).send({ status: false, msg: "Please provide reviewedBy its required and must be in correct format" })
        }
        obj.reviewedBy = reviewedBy
    }
        if(rating){

        if (typeof rating !== "number") {
            return res.status(400).send({ status: false, msg: "Please provide rating its required and must be in correct format" })
        }
        if(!/^[0-9]$/.test(rating)){
            return res.status(400).send({status : false , msg : "rating Must be Integer"})
        }
        if (rating < 1 || rating > 5) {
            return res.status(400).send({ status: false, msg: "rating should be min 1 and max 5" })
        }
        obj.rating = rating
    }
        if(review){
            
            if (!isValid(review)) {
                return res.status(400).send({ status: false, msg: " Please provide review its required and must be in correct format" })
            }
            obj.review = review
        }

        const updateReview =  await reviewModel.findByIdAndUpdate({_id :reviewId},{$set :obj},{new : true}).select({__v : 0 ,updatedAt : 0,createdAt : 0 , isDeleted : 0})

      //  let combineBookRewiew = JSON.parse(JSON.stringify(requiredBook))
        requiredBook["reviewData"] = updateReview

        return res.status(200).send({status : true , msg : "Update Success Done", data : requiredBook})

    }catch(err){
        return res.status(500).send({status : false , msg : err.message})
    }
}


const deleteReview = async function (req, res) {

    try {
        
        let bookId = req.params.bookId;
        let reviewId = req.params.reviewId;
        
        if (!mongoose.Types.ObjectId.isValid(bookId)) return res.status(400).send({ status: false, message: "invalid BookId" })

        const requiredBook = await bookModel.findOne({ _id: bookId, isDeleted: false })
        if (!requiredBook) return res.status(404).send({ status: false, message: "No Such book present or book already deleted" })

        if (!mongoose.Types.ObjectId.isValid(reviewId)) return res.status(400).send({ status: false, message: "invalid reviewId" })
        const requiredReview = await reviewModel.findOne({ _id: reviewId, bookId: bookId, isDeleted: false })

        if (!requiredReview) return res.status(404).send({status: false, message: "No any review of the book"})


      let updateData  = await reviewModel.findOneAndUpdate( { _id : reviewId , isDeleted: false}, {$set: { isDeleted : true} }, { new: true })
      let book = await bookModel.findByIdAndUpdate( {_id: bookId},{$inc: {reviews:-1}},{new : true})
      
      
      return res.status(200).send({ status: true, msg: updateData });

        
    }
    catch (err) {

        res.status(500).send({
            status: false,
            msg: err.message
        })
    }
}
        

 module.exports = { CreateReview , updateReview , deleteReview}