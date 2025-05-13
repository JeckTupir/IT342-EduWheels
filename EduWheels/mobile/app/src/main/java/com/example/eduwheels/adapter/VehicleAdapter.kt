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

class VehicleAdapter(private val vehicles: List<Vehicle>) :
    RecyclerView.Adapter<VehicleAdapter.VehicleViewHolder>() {

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): VehicleViewHolder {
        val view = LayoutInflater.from(parent.context).inflate(R.layout.item_vehicle, parent, false)
        return VehicleViewHolder(view)
    }

    override fun onBindViewHolder(holder: VehicleViewHolder, position: Int) {
        holder.bind(vehicles[position])
    }

    override fun getItemCount(): Int = vehicles.size

    class VehicleViewHolder(view: View) : RecyclerView.ViewHolder(view) {
        private val vehicleType = view.findViewById<TextView>(R.id.vehicleType)
        private val vehicleName = view.findViewById<TextView>(R.id.vehicleName)
        private val capacity = view.findViewById<TextView>(R.id.capacity)
        private val plateNumber = view.findViewById<TextView>(R.id.plateNumber)
        private val status = view.findViewById<TextView>(R.id.status)
        private val busImage = view.findViewById<ImageView>(R.id.busImage)
        private val bookButton = view.findViewById<Button>(R.id.bookbtn)

        fun bind(vehicle: Vehicle) {
            vehicleType.text = vehicle.type
            vehicleName.text = vehicle.vehicleName
            capacity.text = "Capacity: ${vehicle.capacity}"
            plateNumber.text = "Plate Number: ${vehicle.plateNumber}"
            status.text = "Status: ${vehicle.status}"

            val context = itemView.context
            if (!vehicle.photoPath.isNullOrBlank()) {
                val imageUrl = "https://it342-eduwheels.onrender.com/api/vehicles/uploads/${vehicle.photoPath}"
                Glide.with(context)
                    .load(imageUrl)
                    .placeholder(R.drawable.bus)
                    .into(busImage)
            } else {
                busImage.setImageResource(R.drawable.bus)
            }

            bookButton.setOnClickListener {
                val intent = Intent(context, VehicleDetails::class.java).apply {
                    putExtra("vehicleType", vehicle.type)
                    putExtra("vehicleName", vehicle.vehicleName)
                    putExtra("capacity", vehicle.capacity)
                    putExtra("plateNumber", vehicle.plateNumber)
                    putExtra("status", vehicle.status)
                }
                context.startActivity(intent)
                if (context is Activity) context.finish()
            }
        }
    }
}
