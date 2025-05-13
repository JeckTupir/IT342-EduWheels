package com.example.eduwheels.maps

import android.app.Dialog
import android.content.Context
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import androidx.appcompat.app.AlertDialog
import androidx.fragment.app.DialogFragment
import com.example.eduwheels.R
import com.google.android.gms.maps.CameraUpdateFactory
import com.google.android.gms.maps.GoogleMap
import com.google.android.gms.maps.OnMapReadyCallback
import com.google.android.gms.maps.SupportMapFragment
import com.google.android.gms.maps.model.LatLng

class MapPickerDialog(
    private val listener: (LatLng) -> Unit
) : DialogFragment(), OnMapReadyCallback {

    private lateinit var map: GoogleMap

    override fun onCreateDialog(savedInstanceState: Bundle?): Dialog {
        val inflater = LayoutInflater.from(context)
        val view = inflater.inflate(R.layout.activity_map_picker_dialog, null)

        val mapFragment = childFragmentManager
            .findFragmentById(R.id.dialogMap) as SupportMapFragment
        mapFragment.getMapAsync(this)

        return AlertDialog.Builder(requireContext())
            .setView(view)
            .setNegativeButton("Cancel") { dialog, _ -> dialog.dismiss() }
            .create()
    }

    override fun onMapReady(googleMap: GoogleMap) {
        map = googleMap

        val defaultLatLng = LatLng(14.5995, 120.9842) // Manila or any default
        map.moveCamera(CameraUpdateFactory.newLatLngZoom(defaultLatLng, 12f))

        map.setOnMapClickListener { latLng ->
            listener(latLng)
            dismiss()
        }
    }
}
