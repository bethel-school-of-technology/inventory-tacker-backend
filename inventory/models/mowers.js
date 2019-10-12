'use strict';
module.exports = (sequelize, DataTypes) => {
	const mowers = sequelize.define(
		'mowers',
		{
			MowerId: {
				allowNull: false,
				autoIncrement: true,
				primaryKey: true,
				type: DataTypes.INTEGER
			},
			MowerName: DataTypes.STRING,
			MowerType: DataTypes.STRING,
			Inventory: DataTypes.INTEGER,
			UserId: {
				type: DataTypes.INTEGER,
				references: {
					model: 'users',
					key: 'UserId'
				}
			},
			Deleted: {
				type: DataTypes.BOOLEAN,
				defaultValue: false
			},
			createdAt: {
				type: DataTypes.DATE,
				allowNull: false
			},
			updatedAt: {
				type: DataTypes.DATE,
				allowNull: false
			}
		},
		{}
	);
	mowers.associate = function(models) {
		// associations can be defined here
	};
	return mowers;
};
