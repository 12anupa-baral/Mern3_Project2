import { Table,Column,Model,DataType, PrimaryKey, AllowNull } from "sequelize-typescript";

@Table({
    tableName: 'products',
    modelName:'Product',//connection through database
    timestamps: true

})

// class name = model name

class Product extends Model{
    @Column({
        primaryKey: true,
        type:DataType.UUID,
        defaultValue :DataType.UUIDV4,

    })
    declare id:string


@Column({ 
    type:DataType.STRING,
    // AllowNull:false
   
})
declare productName:string

@Column({ 
    type:DataType.TEXT,
   
})
declare productDescription:string


@Column({ 
    type:DataType.FLOAT,
    // AllowNull:false
   
})
declare productPrice:number

@Column({ 
    type:DataType.INTEGER,
   
})
declare productStock:number

@Column({ 
    type:DataType.INTEGER,
   
})
declare discount:number

@Column({
    type : DataType.STRING
})
declare productImageUrl : string
}


export default Product
