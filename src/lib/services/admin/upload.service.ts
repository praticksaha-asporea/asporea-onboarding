import mongoose from "mongoose";
import { Upload } from "../../../lib/models/Upload.model";
import { ApiError } from "../../error/api.error";
import fs from "fs";
import path from "path";

export const getUploadsList = async (query: {
  page?: number;
  limit?: number;
  role?: string;
}) => {
  const page = query.page || 1;
  const limit = query.limit || 10;
  const skip = (page - 1) * limit;

  const pipeline: any[] = [
    {
      $lookup: {
        from: "users",
        localField: "userId",
        foreignField: "_id",
        as: "user",
      },
    },
    {
      $unwind: {
        path: "$user",
        preserveNullAndEmptyArrays: true,
      },
    },
     
    {
      $addFields: {
        "user.profilePicStr": {
          $cond: {
            if: { $not: ["$user.profilePic"] },
            then: "",
            else: { $toString: "$user.profilePic" }
          }
        }
      }
    },
   
    {
      $lookup: {
        from: 'uploads', 
        let: { picStr: '$user.profilePicStr' },
        pipeline: [
          {
            $match: {
              $expr: {
                $eq: [{ $toString: '$_id' }, '$$picStr']
              }
            }
          }
        ],
        as: 'userDpDetails'
      }
    }
  ];

//   pipeline.push({                       // Condition to hide profile pictures from upload page
//     $match: {
//       path: { $not: /^\/uploads\/profiles\// }
//     }
//   });

  if (query.role) {
    pipeline.push({
      $match: {
        "user.role": query.role,
      },
    });
  }

  pipeline.push({ $sort: { createdAt: -1 } });

  pipeline.push({
    $facet: {
      metadata: [{ $count: "total" }],
      data: [
        { $skip: skip },
        { $limit: limit },
        {
          $project: {
            _id: 1,
            path: 1,
            publicId: 1,
            createdAt: 1,
            "user._id": 1,
            "user.firstName": 1,
            "user.lastName": 1,
            "user.email": 1,
            "user.role": 1,
            
            "user.profilePic": { $arrayElemAt: ["$userDpDetails.path", 0] }
          },
        },
      ],
    },
  });

  const result = await Upload.aggregate(pipeline);

  const data = result[0]?.data || [];
  const total = result[0]?.metadata[0]?.total || 0;
  const totalPages = Math.ceil(total / limit);

  return {
    data,
    pagination: {
      total,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  };
};

export const deleteUploadById = async (id: string) => {
  const upload = await Upload.findById(id);
  if (!upload) {
    throw new ApiError("Upload not found", 404);
  }

  
  if (upload.path && upload.path.startsWith("/uploads")) {
    const absolutePath = path.join(process.cwd(), "public", upload.path);
    if (fs.existsSync(absolutePath)) {
      try {
        fs.unlinkSync(absolutePath);
      } catch (err) {
        console.error("Failed to delete physical file:", err);
      }
    }
  }

    
  await Upload.findByIdAndDelete(id);
  return true;
};