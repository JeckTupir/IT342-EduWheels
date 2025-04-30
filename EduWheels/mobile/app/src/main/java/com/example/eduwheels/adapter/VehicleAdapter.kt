package com.example.eduwheels.adapter

import android.app.Activity
import android.content.Intent
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.*
import androidx.recyclerview.widget.RecyclerView
import com.bumptech.glide.Glide
import com.example.eduwheels.R
import com.example.eduwheels.models.Vehicle
import com.example.eduwheels.vehicle.VehicleDetails

class VehicleAdapter(private val vehicles: List<Vehicle.Vehicle>) :
    RecyclerView.Adapter<VehicleAdapter.VehicleViewHolder>() {

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): VehicleViewHolder {
        val view = LayoutInflater.from(parent.context).inflate(R.layout.item_vehicle, parent, false)
        return VehicleViewHolder(view)
    }

    override fun onBindViewHolder(holder: VehicleViewHolder, position: Int) {
        val vehicle = vehicles[position]
        holder.bind(vehicle)
    }

    override fun getItemCount(): Int = vehicles.size

    class VehicleViewHolder(view: View) : RecyclerView.ViewHolder(view) {
        fun bind(vehicle: Vehicle.Vehicle) {
            val vehicleType = itemView.findViewById<TextView>(R.id.vehicleType)
            val vehicleName = itemView.findViewById<TextView>(R.id.vehicleName)
            val capacity = itemView.findViewById<TextView>(R.id.capacity)
            val plateNumber = itemView.findViewById<TextView>(R.id.plateNumber)
            val status = itemView.findViewById<TextView>(R.id.status)
            val busImage = itemView.findViewById<ImageView>(R.id.busImage) // Correct ID
            val bookButton = itemView.findViewById<Button>(R.id.bookbtn)

            vehicleType.text = vehicle.type
            vehicleName.text = vehicle.vehicleName
            capacity.text = "Capacity: ${vehicle.capacity}"
            plateNumber.text = "Plate Number: ${vehicle.plateNumber}"
            status.text = "Status: ${vehicle.status}"

            if (!vehicle.photoPath.isNullOrEmpty()) {
                val fullImageUrl = "http://192.168.74.208:8080/api/vehicles/uploads/${vehicle.photoPath}"
                Glide.with(itemView.context)
                    .load(fullImageUrl)
                    .placeholder(R.drawable.bus)
                    .into(busImage)
            } else {
                busImage.setImageResource(R.drawable.bus)
            }

            bookButton.setOnClickListener {
                val context = itemView.context
                val intent = Intent(context, VehicleDetails::class.java).apply {
                    putExtra("vehicleType", vehicle.type)
                    putExtra("vehicleName", vehicle.vehicleName)
                    putExtra("capacity", vehicle.capacity)
                    putExtra("plateNumber", vehicle.plateNumber)
                    putExtra("status", vehicle.status)
                }
                context.startActivity(intent)

                if (context is Activity) {
                    context.finish()
                }
            }
        }
    }
}
