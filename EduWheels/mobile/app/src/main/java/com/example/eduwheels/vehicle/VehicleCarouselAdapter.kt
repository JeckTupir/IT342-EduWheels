package com.example.eduwheels.vehicle

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import com.example.eduwheels.R
import com.example.eduwheels.models.Vehicle

class VehicleCarouselAdapter(
    private val vehicles: List<Vehicle>,
    private val onSelect: (Vehicle) -> Unit
) : RecyclerView.Adapter<VehicleCarouselAdapter.ViewHolder>() {

    inner class ViewHolder(view: View) : RecyclerView.ViewHolder(view) {
        val vehicleText: TextView = view.findViewById(R.id.vehicleInfo)

        init {
            view.setOnClickListener {
                onSelect(vehicles[adapterPosition])
            }
        }
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewHolder {
        val view = LayoutInflater.from(parent.context)
            .inflate(R.layout.vehicle_item, parent, false)
        return ViewHolder(view)
    }

    override fun getItemCount(): Int = vehicles.size

    override fun onBindViewHolder(holder: ViewHolder, position: Int) {
        val v = vehicles[position]
        holder.vehicleText.text = "${v.vehicleName} (${v.capacity} seats)"
    }
}
